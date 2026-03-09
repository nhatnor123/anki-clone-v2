import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

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
    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html }}
                style={styles.webview}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
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
