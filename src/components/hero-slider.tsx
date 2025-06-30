
"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import type { Slide } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSlider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) return;
        
        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };
        api.on("select", onSelect);
        onSelect(); // Set initial value
        
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

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
        return (
            <section className="my-8 md:my-12">
                <Skeleton className="w-full aspect-[16/7] rounded-xl" />
            </section>
        );
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
        <section className="my-8 md:my-12">
            <Carousel 
                className="w-full"
                plugins={[
                    Autoplay({
                      delay: 8000,
                      stopOnInteraction: true,
                    }),
                ]}
                opts={{
                    align: "center",
                    loop: true,
                }}
                setApi={setApi}
            >
                <CarouselContent className="-ml-6">
                    {slides.map((slide, index) => (
                        <CarouselItem key={slide.id} className="pl-6 md:basis-5/6">
                             <Link href={slide.link || '#'} className="block relative aspect-[16/7] w-full transition-all duration-500 ease-in-out"
                                style={{
                                    transform: `scale(${current === index ? 1 : 0.85})`, 
                                    opacity: current === index ? 1 : 0.5 
                                }}
                             >
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover rounded-xl"
                                    priority={index === 0}
                                    data-ai-hint="hero slider"
                                />
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none z-10" />
            </Carousel>
        </section>
    );
}
