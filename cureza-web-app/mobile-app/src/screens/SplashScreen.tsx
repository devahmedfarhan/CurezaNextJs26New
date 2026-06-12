import React, { useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.gradient}
            >
                <View style={styles.logoContainer}>
                    {/* Placeholder logo - replace with actual logo */}
                    <View style={styles.logoPlaceholder}>
                        <View style={styles.logoInner} />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoInner: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.textOnPrimary,
    },
});

export default SplashScreen;
