"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import type { Slide } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSlider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/slides');
                if (!res.ok) throw new Error('Failed to fetch slides');
                const data = await res.json();
                setSlides(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
    }, []);

    if (loading) {
        return <Skeleton className="w-full aspect-[16/7]" />;
    }

    if (!slides || slides.length === 0) {
        return (
            <section className="relative my-12 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-teal-400 p-8 text-center text-white md:my-16">
                <div className="relative z-10 mx-auto max-w-4xl">
                <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                    Welcome to Our Store
                </h1>
                <p className="mb-8 text-lg text-white/90 md:text-xl">
                    Explore our curated selection of cutting-edge electronics.
                </p>
                </div>
            </section>
        );
    }

    return (
        <Carousel 
            className="w-full"
            plugins={[
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: false,
                }),
            ]}
            opts={{
                loop: true,
            }}
        >
            <CarouselContent>
                {slides.map((slide, index) => (
                    <CarouselItem key={slide.id}>
                        <div className="relative aspect-[16/7] w-full overflow-hidden">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                data-ai-hint="hero slider"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
                            <div className="absolute inset-0 flex items-center justify-start p-8 md:p-16 lg:p-24">
                                <div className="max-w-md text-left text-white">
                                    <h1 className="mb-4 font-headline text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                                        {slide.title}
                                    </h1>
                                    <p className="mb-8 text-md text-white/90 md:text-lg">
                                        {slide.description}
                                    </p>
                                    {slide.link && slide.buttonText && (
                                        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                            <Link href={slide.link}>
                                                {slide.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
        </Carousel>
    );
}
