"use client";
import { usePathname } from 'next/navigation';

export function AdminPageHeader() {
    const pathname = usePathname();
    // e.g. /admin/customers -> Customers
    const title = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
    
    // Capitalize first letter of each word
    const formattedTitle = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return <h1 className="flex-1 text-lg font-semibold">{formattedTitle === 'Admin' ? 'Dashboard' : formattedTitle}</h1>;
}
