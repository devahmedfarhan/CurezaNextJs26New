import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
    TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants';
import { Button, TextInput } from '../../components';
import { useAuthStore } from '../../store';
import { getApiErrorMessage } from '../../api';
import { AuthStackParamList } from '../../navigation/types';

type OTPScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
type OTPScreenRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

const OTP_LENGTH = 6;

export const OTPVerificationScreen: React.FC = () => {
    const navigation = useNavigation<OTPScreenNavigationProp>();
    const route = useRoute<OTPScreenRouteProp>();
    const { verifyOtp, resetPassword, sendOtp, isLoading } = useAuthStore();

    const { email, phone, mode } = route.params;

    const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [passwordError, setPasswordError] = useState('');

    const inputRefs = useRef<(RNTextInput | null)[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const values = value.slice(0, OTP_LENGTH).split('');
            const newOtp = [...otp];
            values.forEach((v, i) => {
                if (index + i < OTP_LENGTH) {
                    newOtp[index + i] = v;
                }
            });
            setOtp(newOtp);
            const lastIndex = Math.min(index + values.length, OTP_LENGTH - 1);
            inputRefs.current[lastIndex]?.focus();
        } else {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        try {
            await sendOtp(email, phone);
            setResendTimer(60);
            Alert.alert('Success', 'Verification code has been resent');
        } catch (error) {
            Alert.alert('Error', getApiErrorMessage(error));
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== OTP_LENGTH) {
            Alert.alert('Error', 'Please enter the complete verification code');
            return;
        }

        if (mode === 'reset') {
            if (!newPassword || newPassword.length < 8) {
                setPasswordError('Password must be at least 8 characters');
                return;
            }
            if (newPassword !== confirmPassword) {
                setPasswordError('Passwords do not match');
                return;
            }

            try {
                await resetPassword(email!, otpCode, newPassword);
                Alert.alert('Success', 'Password reset successfully', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            } catch (error) {
                Alert.alert('Error', getApiErrorMessage(error));
            }
        } else {
            try {
                await verifyOtp(otpCode, email, phone);
                // Navigation will happen automatically
            } catch (error) {
                Alert.alert('Error', getApiErrorMessage(error));
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark-outline" size={48} color={colors.primary} />
                    </View>

                    <Text style={styles.title}>Verify Your {mode === 'reset' ? 'Identity' : 'Account'}</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit code to{'\n'}
                        <Text style={styles.highlight}>{email || phone}</Text>
                    </Text>

                    {/* OTP Input */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <RNTextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[styles.otpInput, digit && styles.otpInputFilled]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(index, value)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* New Password Fields (for reset mode) */}
                    {mode === 'reset' && (
                        <View style={styles.passwordFields}>
                            <TextInput
                                label="New Password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                leftIcon="lock-closed-outline"
                                error={passwordError}
                            />

                            <TextInput
                                label="Confirm Password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                leftIcon="lock-closed-outline"
                            />
                        </View>
                    )}

                    {/* Resend */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        {resendTimer > 0 ? (
                            <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={styles.resendLink}>Resend Code</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Button
                        title={mode === 'reset' ? 'Reset Password' : 'Verify'}
                        onPress={handleVerify}
                        loading={isLoading}
                        fullWidth
                        style={styles.verifyButton}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    highlight: {
        color: colors.primary,
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.backgroundSecondary,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    otpInputFilled: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight + '10',
    },
    passwordFields: {
        marginBottom: spacing.lg,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    resendText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    timerText: {
        ...typography.body,
        color: colors.textLight,
    },
    resendLink: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
    verifyButton: {
        marginTop: 'auto',
    },
});

export default OTPVerificationScreen;
