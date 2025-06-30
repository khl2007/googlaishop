
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import getDatabase from '@/lib/database';
import { 
    getShippingMethods,
    getCityByNameAndCountry,
    getAreaByNameAndCity,
    getProductWeights,
} from '@/lib/data';

async function getUserFromSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    if (sessionCookie?.value) {
        try {
            return JSON.parse(sessionCookie.value);
        } catch (e) {
            return null;
        }
    }
    return null;
}

export async function POST(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { addressId, cartItems } = await request.json();

    if (!addressId || !cartItems) {
        return NextResponse.json({ message: 'Address ID and cart items are required' }, { status: 400 });
    }

    try {
        const db = getDatabase();
        
        const address = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, user.id], (err, row) => {
                if(err) return reject(new Error('DB error getting address'));
                if(!row) return reject(new Error('Address not found'));
                resolve(row);
            });
        });

        const cityRow = address.city ? await getCityByNameAndCountry(address.city, address.country) : null;
        const cityId = cityRow?.id;
        const areaRow = (address.area && cityId) ? await getAreaByNameAndCity(address.area, cityId) : null;
        const areaId = areaRow?.id;
        
        const productIds = [...new Set(cartItems.map(item => item.productId))];
        const productWeights = await getProductWeights(productIds);
        const weightsMap = new Map(productWeights.map(p => [p.id, p.weight || 0]));
        
        const totalWeight = cartItems.reduce((acc, item) => {
            const weight = weightsMap.get(item.productId) || 0;
            return acc + (weight * item.quantity);
        }, 0);

        const allShippingMethods = await getShippingMethods();
        const enabledMethods = allShippingMethods.filter(m => m.enabled);

        const calculatedMethods = enabledMethods.map(method => {
            let cost = -1;
            const config = typeof method.config === 'string' ? JSON.parse(method.config) : (method.config || {});

            if (method.cost_type === 'weight') {
                cost = totalWeight * (config.cost_per_kg || 0);
            } else if (method.cost_type === 'city') {
                const override = config.overrides?.find(o => o.type === 'city' && o.locationId === cityId);
                cost = override !== undefined ? override.cost : method.default_cost;
            } else if (method.cost_type === 'area') {
                const override = config.overrides?.find(o => o.type === 'area' && o.locationId === areaId);
                // If no area override, fall back to default cost for the method
                cost = override !== undefined ? override.cost : method.default_cost;
            }

            return {
                id: method.id,
                title: method.title,
                logo: method.logo,
                cost: cost,
            };
        }).filter(method => method.cost !== -1 && method.cost !== null);

        return NextResponse.json(calculatedMethods);

    } catch (error) {
        console.error("Shipping cost calculation error:", error);
        return NextResponse.json({ message: 'Failed to calculate shipping costs', error: error.message }, { status: 500 });
    }
}
