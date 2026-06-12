import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const BANNER_HEIGHT = 160;

interface BannerItem {
    id: number;
    title: string;
    subtitle: string;
    buttonText: string;
    gradientColors: readonly [string, string, ...string[]];
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
}

interface BannerSliderProps {
    onShopNow?: () => void;
}

// Premium banner data
const BANNERS: BannerItem[] = [
    {
        id: 1,
        title: 'Get 20% OFF',
        subtitle: 'On your first order',
        buttonText: 'Shop Now',
        gradientColors: ['#10B981', '#059669'] as const,
        icon: 'gift-outline',
    },
    {
        id: 2,
        title: 'Premium Wellness',
        subtitle: 'Curated products for you',
        buttonText: 'Explore',
        gradientColors: ['#6366F1', '#4F46E5'] as const,
        icon: 'sparkles-outline',
    },
    {
        id: 3,
        title: 'Free Shipping',
        subtitle: 'On orders above ₹499',
        buttonText: 'Order Now',
        gradientColors: ['#F59E0B', '#D97706'] as const,
        icon: 'car-outline',
    },
];

export const BannerSlider: React.FC<BannerSliderProps> = ({ onShopNow }) => {
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Auto-scroll every 4 seconds
        autoScrollRef.current = setInterval(() => {
            const nextIndex = (activeIndex + 1) % BANNERS.length;
            scrollRef.current?.scrollTo({
                x: nextIndex * BANNER_WIDTH,
                animated: true,
            });
            setActiveIndex(nextIndex);
        }, 4000);

        return () => {
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
            }
        };
    }, [activeIndex]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / BANNER_WIDTH);
        if (index !== activeIndex && index >= 0 && index < BANNERS.length) {
            setActiveIndex(index);
        }
    };

    const renderBanner = (banner: BannerItem) => (
        <View key={banner.id} style={styles.bannerContainer}>
            <LinearGradient
                colors={banner.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBanner}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    <TouchableOpacity
                        style={styles.bannerButton}
                        onPress={banner.onPress || onShopNow}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.bannerButtonText}>{banner.buttonText}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bannerIconContainer}>
                    <Ionicons name={banner.icon} size={64} color="rgba(255,255,255,0.3)" />
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={BANNER_WIDTH}
                contentContainerStyle={styles.scrollContent}
            >
                {BANNERS.map(renderBanner)}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {BANNERS.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === activeIndex && styles.activeDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    scrollContent: {
        gap: 0,
    },
    bannerContainer: {
        width: BANNER_WIDTH,
    },
    gradientBanner: {
        width: '100%',
        height: BANNER_HEIGHT,
        borderRadius: borderRadius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        overflow: 'hidden',
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        ...typography.h2,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    bannerSubtitle: {
        ...typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: spacing.md,
    },
    bannerButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        ...typography.bodySmall,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    bannerIconContainer: {
        position: 'absolute',
        right: spacing.lg,
        opacity: 0.8,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    activeDot: {
        width: 24,
        backgroundColor: colors.primary,
    },
});

export default BannerSlider;
