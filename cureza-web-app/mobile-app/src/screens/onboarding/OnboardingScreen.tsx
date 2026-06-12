import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    StatusBar,
    TouchableOpacity,
    Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants';
import { config } from '../../constants';
import { Button } from '../../components';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    backgroundColor: string;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        icon: 'medical',
        title: 'Quality Healthcare Products',
        description: 'Browse from thousands of verified medicines, wellness products, and healthcare essentials from top brands.',
        backgroundColor: colors.primary,
    },
    {
        id: '2',
        icon: 'flash',
        title: 'Fast & Reliable Delivery',
        description: 'Get your orders delivered to your doorstep quickly and safely. Track your shipment in real-time.',
        backgroundColor: colors.secondary,
    },
    {
        id: '3',
        icon: 'shield-checkmark',
        title: 'Secure & Trusted',
        description: '100% genuine products with easy returns. Your health is our priority.',
        backgroundColor: colors.primaryDark,
    },
    {
        id: '4',
        icon: 'gift',
        title: 'Earn Rewards',
        description: 'Join Cureza Circle and earn points on every purchase. Enjoy exclusive offers and discounts.',
        backgroundColor: colors.secondaryDark,
    },
];

export const OnboardingScreen: React.FC = () => {
    const navigation = useNavigation();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleSkip = async () => {
        await SecureStore.setItemAsync(config.STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
        navigation.reset({ index: 0, routes: [{ name: 'Auth' as never }] });
    };

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await handleSkip();
        }
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={100} color={colors.textOnPrimary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {slides.map((_, index) => {
                const inputRange = [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                ];

                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 24, 8],
                    extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        style={[styles.dot, { width: dotWidth, opacity }]}
                    />
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />

            {/* Bottom Section */}
            <View style={styles.bottomContainer}>
                {renderDots()}

                <Button
                    title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    variant="secondary"
                    fullWidth
                    rightIcon={
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color={colors.textOnPrimary}
                        />
                    }
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: spacing.lg,
        zIndex: 10,
        padding: spacing.sm,
    },
    skipText: {
        ...typography.body,
        color: colors.textOnPrimary,
        opacity: 0.8,
    },
    slide: {
        width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    iconContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        color: colors.textOnPrimary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        ...typography.body,
        color: colors.textOnPrimary,
        opacity: 0.9,
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.xl,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textOnPrimary,
        marginHorizontal: 4,
    },
    nextButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});

export default OnboardingScreen;
