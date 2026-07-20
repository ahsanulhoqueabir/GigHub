import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { formatPrice } from "@/lib/currency";
import { useAuthStore } from "@/store/auth.store";
import { useGigsStore } from "@/store/gigs.store";
import { useOrdersStore } from "@/store/orders.store";
import { toast } from "@/store/toast.store";
import type { GIGPackageTier } from "@/types/db/gig.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, Linking, ScrollView, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TIERS: GIGPackageTier[] = ["BASIC", "STANDARD", "PREMIUM"];

export default function GigDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const gig = useGigsStore((s) => s.currentGig);
  const isLoading = useGigsStore((s) => s.isLoadingDetail);
  const fetchGigBySlug = useGigsStore((s) => s.fetchGigBySlug);
  const clearDetail = useGigsStore((s) => s.clearDetail);
  const createGigOrder = useGigsStore((s) => s.createGigOrder);
  const isMutating = useGigsStore((s) => s.isMutating);

  const initiatePayment = useOrdersStore((s) => s.initiatePayment);
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);

  const [activeTier, setActiveTier] = useState<GIGPackageTier>("BASIC");
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (slug) fetchGigBySlug(slug);
    return () => clearDetail();
  }, [slug, fetchGigBySlug, clearDetail]);

  const availableTiers = useMemo(
    () => gig?.packages.map((p) => p.tier) ?? [],
    [gig],
  );

  useEffect(() => {
    if (availableTiers.length > 0 && !availableTiers.includes(activeTier)) {
      setActiveTier(availableTiers[0]);
    }
  }, [availableTiers, activeTier]);

  const selectedPackage = gig?.packages.find((p) => p.tier === activeTier);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning("You must log in first to place an order!");
      router.push("/(auth)/login");
      return;
    }
    setCheckoutVisible(true);
  };

  const handleConfirmOrder = async () => {
    if (!gig || !selectedPackage) return;
    try {
      const order = await createGigOrder({
        gig: gig.id,
        package: activeTier,
        description: description.trim() || undefined,
        note: note.trim() || undefined,
      });
      if (!order?.id) throw new Error("Order could not be created");

      const gatewayUrl = await initiatePayment(order.id);
      setCheckoutVisible(false);
      setDescription("");
      setNote("");

      if (gatewayUrl) {
        await Linking.openURL(gatewayUrl);
        toast.success("Complete your payment in the browser");
      } else {
        toast.success("Order created");
      }
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading || !gig) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Gig" showBack />
        <View className="gap-4 p-6">
          <Skeleton height={SCREEN_WIDTH * 0.6} rounded="lg" />
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} width="40%" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Gig Details" showBack />

      <ScrollView contentContainerClassName="pb-32">
        {gig.images && gig.images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {gig.images.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.6 }}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={{ height: SCREEN_WIDTH * 0.5 }}
            className="items-center justify-center bg-gray-100 dark:bg-gray-800"
          >
            <Ionicons name="image-outline" size={40} color="#D1D5DB" />
          </View>
        )}

        <View className="gap-4 px-6 pt-5">
          {gig.category ? (
            <Badge variant="info">{gig.category.name}</Badge>
          ) : null}
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {gig.title}
          </Text>

          <View className="flex-row items-center gap-1">
            <Ionicons name="eye-outline" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {gig.views} views
            </Text>
          </View>

          {/* Seller card */}
          <View className="flex-row items-center gap-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
            <Avatar uri={gig.seller.avatar} name={gig.seller.name} size="md" />
            <View className="flex-1">
              <View className="flex-row items-center gap-1">
                <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                  {gig.seller.name}
                </Text>
                {gig.seller.verified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={COLORS.primary}
                  />
                ) : null}
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                @{gig.seller.username}
              </Text>
            </View>
          </View>

          <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
            Description
          </Text>
          <Text className="leading-5 text-gray-600 dark:text-gray-300">
            {gig.description}
          </Text>

          {gig.tags && gig.tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {gig.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </View>
          ) : null}

          {/* Package tabs */}
          <Text className="mt-2 text-[15px] font-semibold text-gray-900 dark:text-gray-100">
            Packages
          </Text>
          <View className="flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
            {TIERS.filter((t) => availableTiers.includes(t)).map((tier) => (
              <View key={tier} className="flex-1">
                <Text
                  onPress={() => setActiveTier(tier)}
                  className={`rounded-lg py-2 text-center text-xs font-semibold capitalize ${
                    activeTier === tier
                      ? "bg-white text-primary dark:bg-gray-800"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {tier.toLowerCase()}
                </Text>
              </View>
            ))}
          </View>

          {selectedPackage ? (
            <View className="gap-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {selectedPackage.title}
                </Text>
                <Text className="text-lg font-bold text-primary">
                  {formatPrice(selectedPackage.price)}
                </Text>
              </View>
              <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300">
                {selectedPackage.description}
              </Text>

              <View className="flex-row gap-4">
                {selectedPackage.delivery_days != null ? (
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPackage.delivery_days}-day delivery
                    </Text>
                  </View>
                ) : null}
                {selectedPackage.revisions != null ? (
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons
                      name="refresh-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPackage.revisions} revisions
                    </Text>
                  </View>
                ) : null}
              </View>

              {selectedPackage.features &&
              selectedPackage.features.length > 0 ? (
                <View className="gap-1.5">
                  {selectedPackage.features.map((feature) => (
                    <View key={feature} className="flex-row items-center gap-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color="#16A34A"
                      />
                      <Text className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {gig.faq && gig.faq.length > 0 ? (
            <View className="gap-3">
              <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                FAQ
              </Text>
              {gig.faq.map((item) => (
                <View key={item.question}>
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.question}
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {item.answer}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center gap-3 border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <View className="flex-1">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {activeTier}
          </Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(selectedPackage?.price)}
          </Text>
        </View>
        <Button onPress={handleCheckout} className="flex-1">
          Order Now
        </Button>
      </View>

      <Modal
        visible={checkoutVisible}
        onClose={() => setCheckoutVisible(false)}
        title="Confirm Order"
      >
        <View className="gap-4 pb-4">
          <View className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {gig.title}
            </Text>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {activeTier.toLowerCase()} Package
              </Text>
              <Text className="text-lg font-bold text-primary">
                {formatPrice(selectedPackage?.price)}
              </Text>
            </View>
          </View>

          <Input
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what you need in detail…"
            multiline
            numberOfLines={3}
            className="min-h-20 py-3"
            textAlignVertical="top"
          />

          <Input
            label="Note for the seller (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Any specific requirements…"
            multiline
            numberOfLines={3}
            className="min-h-20 py-3"
            textAlignVertical="top"
          />

          <Button onPress={handleConfirmOrder} isLoading={isMutating}>
            Confirm &amp; Pay
          </Button>
          <Text className="text-center text-xs text-gray-400 dark:text-gray-500">
            You'll be redirected to complete payment securely.
          </Text>
        </View>
      </Modal>
    </View>
  );
}
