import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface CardViewProps {
    html: string;
}

export const CardView: React.FC<CardViewProps> = ({ html }) => {
    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html }}
                style={styles.webview}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                allowingReadAccessToURL="file://"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    webview: {
        backgroundColor: 'transparent',
    },
});
