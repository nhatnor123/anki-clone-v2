import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle, StyleSheet } from 'react-native';

interface AnimatedPressableProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({ children, style, ...props }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.92, // Even more noticeable effect as requested
            useNativeDriver: true,
            speed: 60,
            bounciness: 6,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 60,
            bounciness: 6,
        }).start();
    };

    // Flatten style to extract layout properties
    const flattenedStyle = StyleSheet.flatten(style || {});

    // Common layout properties that should stay on the outer Animated.View
    const {
        margin, marginHorizontal, marginVertical, marginTop, marginBottom, marginLeft, marginRight,
        position, top, bottom, left, right,
        flex, flexGrow, flexShrink, flexBasis,
        alignSelf,
        width, height,
        zIndex,
        ...internalStyle
    } = flattenedStyle;

    const layoutStyle = {
        margin, marginHorizontal, marginVertical, marginTop, marginBottom, marginLeft, marginRight,
        position, top, bottom, left, right,
        flex, flexGrow, flexShrink, flexBasis,
        alignSelf,
        width, height,
        zIndex,
    };

    return (
        <Animated.View style={[{ transform: [{ scale }] }, layoutStyle]}>
            <Pressable
                {...props}
                style={internalStyle}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
};
