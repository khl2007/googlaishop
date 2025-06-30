import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCountriesWithCityCount } from "@/lib/data";
import { countries as allCountriesList } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function LocationsPage() {
    const countriesWithCounts = await getCountriesWithCityCount();
    
    const countryData = allCountriesList.map(countryName => {
        const found = countriesWithCounts.find(c => c.country_name === countryName);
        return {
            name: countryName,
            city_count: found ? found.city_count : 0
        };
    });

  return (
    <Card>
        <CardHeader>
            <CardTitle>Manage Locations</CardTitle>
            <CardDescription>
                View and manage the cities available for shipping and registration within each country.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead className="text-center">Cities Managed</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {countryData.map((country) => (
                            <TableRow key={country.name}>
                                <TableCell className="font-medium">{country.name}</TableCell>
                                <TableCell className="text-center">{country.city_count}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/locations/${encodeURIComponent(country.name)}`}>
                                            Manage Cities <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
