import { StyleSheet, View } from 'react-native';

const CenteredContainer = ({ children, style }) => {
  return (
    <View style={[styles.wrapper, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: 650, // Maximum width for content
    width: '100%', // Take up 100% of available space up to maxWidth
    alignSelf: 'center', // Centers the block itself within its parent
    
    // Default Padding (You can override this with the 'style' prop if needed)
    paddingHorizontal: 20, 
    paddingVertical: 10,
  },
});

export default CenteredContainer;