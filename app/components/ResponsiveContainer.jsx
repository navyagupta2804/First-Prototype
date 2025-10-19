import { View, useWindowDimensions } from 'react-native';

const ResponsiveContainer = ({ children }) => {
  const { width } = useWindowDimensions();
  const isWeb = width > 800; // treat 800px+ as desktop

  return (
    <View
      style={{
        width: '100%',
        maxWidth: isWeb ? 700 : '100%',   // constrain width on web
        alignSelf: isWeb ? 'center' : 'flex-start',
        paddingHorizontal: isWeb ? 24 : 12, // more breathing room on desktop
      }}
    >
      {children}
    </View>
  );
};

export default ResponsiveContainer;
