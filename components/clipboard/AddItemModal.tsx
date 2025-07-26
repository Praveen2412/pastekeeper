import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (content: string, type: 'text' | 'url' | 'code') => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { colors, isDark = false } = useTheme();
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'url' | 'code'>('text');

  const handleAdd = useCallback(() => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }
    
    onAdd(content, type);
    setContent('');
    setType('text');
    onClose();
  }, [content, type, onAdd, onClose]);

  const handleClose = useCallback(() => {
    setContent('');
    setType('text');
    onClose();
  }, [onClose]);

  const handlePasteText = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setContent(clipboardContent);
      } else {
        Alert.alert('Error', 'No text found in clipboard');
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View 
            style={[
              styles.modalContainer, 
              { 
                backgroundColor: isDark ? '#1a1a1a' : colors.background,
                borderColor: isDark ? '#333' : colors.border,
              }
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Add New Item
              </Text>
              <TouchableOpacity 
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'text' && { 
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                  type !== 'text' && {
                    borderColor: isDark ? '#444' : colors.border,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                ]}
                onPress={() => setType('text')}
              >
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={22}
                  color={type === 'text' ? colors.primary : colors.text}
                />
                <Text 
                  style={[
                    styles.typeButtonText,
                    { color: type === 'text' ? colors.primary : colors.text }
                  ]}
                >
                  Text
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'url' && { 
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                  type !== 'url' && {
                    borderColor: isDark ? '#444' : colors.border,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                ]}
                onPress={() => setType('url')}
              >
                <MaterialCommunityIcons
                  name="link-variant"
                  size={22}
                  color={type === 'url' ? colors.primary : colors.text}
                />
                <Text 
                  style={[
                    styles.typeButtonText,
                    { color: type === 'url' ? colors.primary : colors.text }
                  ]}
                >
                  URL
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'code' && { 
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                  type !== 'code' && {
                    borderColor: isDark ? '#444' : colors.border,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                ]}
                onPress={() => setType('code')}
              >
                <MaterialCommunityIcons
                  name="code-tags"
                  size={22}
                  color={type === 'code' ? colors.primary : colors.text}
                />
                <Text 
                  style={[
                    styles.typeButtonText,
                    { color: type === 'code' ? colors.primary : colors.text }
                  ]}
                >
                  Code
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text,
                    backgroundColor: isDark ? '#2d2d2d' : '#f5f5f5',
                    borderColor: isDark ? '#444' : colors.border,
                    height: type === 'code' ? 200 : 120,
                    fontFamily: type === 'code' ? 'monospace' : undefined,
                  }
                ]}
                value={content}
                onChangeText={setContent}
                multiline
                placeholder={
                  type === 'text' ? 'Enter text...' :
                  type === 'url' ? 'Enter URL...' :
                  'Enter code...'
                }
                placeholderTextColor={colors.text + '50'}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={type !== 'code'}
              />
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.pasteButton,
                  { 
                    backgroundColor: isDark ? '#333' : '#f0f0f0',
                    borderColor: isDark ? '#444' : colors.border,
                  }
                ]}
                onPress={handlePasteText}
              >
                <MaterialCommunityIcons
                  name="content-paste"
                  size={20}
                  color={colors.text}
                  style={styles.pasteIcon}
                />
                <Text style={[styles.pasteButtonText, { color: colors.text }]}>
                  Paste
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleAdd}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color="white"
                  style={styles.addIcon}
                />
                <Text style={styles.addButtonText}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  typeButtonText: {
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  inputContainer: {
    maxHeight: 300,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
  },
  pasteIcon: {
    marginRight: 6,
  },
  pasteButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  addIcon: {
    marginRight: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default React.memo(AddItemModal); 