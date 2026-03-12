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

export interface CardViewRef {
    scrollToBottom: () => void;
}

export const CardView = React.forwardRef<CardViewRef, CardViewProps>(({ html }, ref) => {
    const webviewRef = React.useRef<WebView>(null);

    React.useImperativeHandle(ref, () => ({
        scrollToBottom: () => {
            webviewRef.current?.injectJavaScript('window.scrollTo(0, document.body.scrollHeight);');
        },
    }));

    return (
        <View style={styles.container}>
            <WebView
                ref={webviewRef}
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
});

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
