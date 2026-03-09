import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import * as FileSystem from 'expo-file-system/legacy';

interface CardViewProps {
    html: string;
}

// export const CardView: React.FC<CardViewProps> = ({ html }) => {
//     const baseUrl = `${FileSystem.documentDirectory}media/4000B1_001.jpg`; // TODO : revert
//     console.log("baseUrl", baseUrl);
//     return (
//         <View style={styles.container}>
//             <WebView
//                 originWhitelist={['*']}
//                 source={{ html }}
//                 style={styles.webview}

//                 scrollEnabled={true}
//                 showsVerticalScrollIndicator={false}
//                 allowFileAccess={true}
//                 allowUniversalAccessFromFileURLs={true}
//                 allowFileAccessFromFileURLs={true}
//                 allowingReadAccessToURL={baseUrl}
//                 javaScriptEnabled={true}
//       domStorageEnabled={true}
//             />
//         </View>
//     );
// };

export const CardView: React.FC<CardViewProps> = ({ html }) => {
    // Point this to the base "media" directory or the DocumentDirectory
    const mediaDir = `${FileSystem.documentDirectory}media/`;

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                // Using baseUrl here allows you to use relative paths in your HTML 
                // e.g., <img src="4000B1_001.jpg" />
                source={{ html, baseUrl: mediaDir }}
                style={styles.webview}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}

                // Security & Access Props
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                allowFileAccessFromFileURLs={true}

                // iOS Specific: Permission to read the directory
                allowingReadAccessToURL={mediaDir}

                javaScriptEnabled={true}
                domStorageEnabled={true}
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
