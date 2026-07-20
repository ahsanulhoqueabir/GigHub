import type { HeroBanner } from "@/types/db/hero-banner.types";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH - 48;
const AUTOPLAY_MS = 4500;

interface HeroCarouselProps {
  banners: HeroBanner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({
          x: next * (SLIDE_WIDTH + 12),
          animated: true,
        });
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / (SLIDE_WIDTH + 12),
    );
    setActiveIndex(index);
  };

  if (banners.length === 0) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SLIDE_WIDTH + 12}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerClassName="gap-3 px-6"
      >
        {banners.map((banner) => (
          <Pressable
            key={banner.id}
            disabled={!banner.button_url}
            onPress={() =>
              banner.button_url && Linking.openURL(banner.button_url)
            }
            style={{ width: SLIDE_WIDTH }}
            className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800"
          >
            <Image
              source={{ uri: banner.image_url }}
              style={{ width: SLIDE_WIDTH, height: (SLIDE_WIDTH * 6) / 16 }}
              contentFit="cover"
              transition={150}
            />
          </Pressable>
        ))}
      </ScrollView>

      {banners.length > 1 ? (
        <View className="mt-3 flex-row justify-center gap-1.5">
          {banners.map((banner, i) => (
            <View
              key={banner.id}
              className={`h-1.5 rounded-full ${i === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-gray-300 dark:bg-gray-700"}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
