import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import {ThemeContext} from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ContactSupportScreen = () => {
  const theme = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditRequest, setCurrentEditRequest] = useState(null);

  const validateEmail = email => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setIsLoading(true);

    const date = new Date().toLocaleString();
    const newRequest = {
      id: Date.now().toString(),
      name,
      email,
      message,
      date,
      status: 'pending',
    };

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Your message has been received. We will get back to you shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              setEmail('');
              setMessage('');
              setPendingRequests([...pendingRequests, newRequest]);

              setTimeout(() => {
                completeRequest(newRequest.id);
              }, 5000);
            },
          },
        ],
      );
    }, 2000);
  };

  const completeRequest = requestId => {
    const requestIndex = pendingRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return;

    const requestToComplete = pendingRequests[requestIndex];
    const updatedPending = pendingRequests.filter(req => req.id !== requestId);

    setPendingRequests(updatedPending);
    setCompletedRequests([
      ...completedRequests,
      {...requestToComplete, status: 'completed'},
    ]);
  };

  const deleteRequest = (requestId, isCompleted) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (isCompleted) {
              setCompletedRequests(
                completedRequests.filter(req => req.id !== requestId),
              );
            } else {
              setPendingRequests(
                pendingRequests.filter(req => req.id !== requestId),
              );
            }
          },
        },
      ],
    );
  };

  const openEditModal = request => {
    setCurrentEditRequest(request);
    setEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    if (!currentEditRequest.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!validateEmail(currentEditRequest.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!currentEditRequest.message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    if (currentEditRequest.status === 'pending') {
      setPendingRequests(
        pendingRequests.map(req =>
          req.id === currentEditRequest.id ? currentEditRequest : req,
        ),
      );
    } else {
      setCompletedRequests(
        completedRequests.map(req =>
          req.id === currentEditRequest.id ? currentEditRequest : req,
        ),
      );
    }

    setEditModalVisible(false);
    Alert.alert('Success', 'Request updated successfully');
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.header, {color: theme.colors.text}]}>
        Contact Support
      </Text>

      <View
        style={[styles.formContainer, {backgroundColor: theme.colors.card}]}>
        <Text style={[styles.label, {color: theme.colors.text}]}>Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.colors.border,
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
            },
          ]}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.placeholder}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, {color: theme.colors.text}]}>Email</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.colors.border,
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
            },
          ]}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, {color: theme.colors.text}]}>Message</Text>
        <TextInput
          style={[
            styles.input,
            styles.messageInput,
            {
              borderColor: theme.colors.border,
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
            },
          ]}
          placeholder="Enter your message"
          placeholderTextColor={theme.colors.placeholder}
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
            <Text style={[styles.loadingText, {color: theme.colors.text}]}>
              Submitting your request...
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, {backgroundColor: theme.colors.primary}]}
            onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={[styles.sectionHeader, {color: theme.colors.text}]}>
            Pending Requests
          </Text>
          {pendingRequests.map(request => (
            <View
              key={request.id}
              style={[
                styles.requestCard,
                {
                  backgroundColor: theme.colors.card,
                  borderLeftColor: '#ffa500',
                  shadowColor: theme.colors.shadow,
                },
              ]}>
              <View style={styles.requestHeader}>
                <Text style={[styles.requestName, {color: theme.colors.text}]}>
                  {request.name}
                </Text>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={() => openEditModal(request)}
                    style={styles.actionButton}>
                    <Icon
                      name="edit"
                      size={20}
                      color={'#4CAF50'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteRequest(request.id, false)}
                    style={styles.actionButton}>
                    <Icon
                      name="delete"
                      size={20}
                      color={'#F44336'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text
                style={[
                  styles.requestEmail,
                  {color: theme.colors.secondaryText || '#666'},
                ]}>
                {request.email}
              </Text>
              <Text style={[styles.requestMessage, {color: theme.colors.text}]}>
                {request.message}
              </Text>
              <View style={styles.requestFooter}>
                <Text style={[styles.requestStatus, {color: '#ffa500'}]}>
                  Status: Pending
                </Text>
                <Text
                style={{
                  color: theme.colors.secondaryText || '#666',
                  fontSize: 12,
                }}>
                Sent: {request.date}
              </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Completed Requests Section */}
      {completedRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={[styles.sectionHeader, {color: theme.colors.text}]}>
            Completed Requests
          </Text>
          {completedRequests.map(request => (
            <View
              key={request.id}
              style={[
                styles.requestCard,
                {
                  backgroundColor: theme.colors.card,
                  borderLeftColor: theme.colors.success,
                  shadowColor: theme.colors.shadow,
                },
              ]}>
              <View style={styles.requestHeader}>
                <Text style={[styles.requestName, {color: theme.colors.text}]}>
                  {request.name}
                </Text>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={() => openEditModal(request)}
                    style={styles.actionButton}>
                    <Icon
                      name="edit"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteRequest(request.id, true)}
                    style={styles.actionButton}>
                    <Icon
                      name="delete"
                      size={20}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text
                style={[
                  styles.requestEmail,
                  {color: theme.colors.secondaryText},
                ]}>
                {request.email}
              </Text>
              <Text style={[styles.requestMessage, {color: theme.colors.text}]}>
                {request.message}
              </Text>
              <View style={styles.requestFooter}>
                <Text style={[styles.requestStatus, {color: theme.colors.success}]}>
                  Status: Completed
                </Text>
                <Text
                  style={[
                    styles.requestDate,
                    {color: theme.colors.secondaryText},
                  ]}>
                  Sent: {request.date}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              {backgroundColor: theme.colors.card},
            ]}>
            <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
              Edit Request
            </Text>
            
            <Text style={[styles.label, {color: theme.colors.text}]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                },
              ]}
              value={currentEditRequest?.name}
              onChangeText={text =>
                setCurrentEditRequest({...currentEditRequest, name: text})
              }
            />

            <Text style={[styles.label, {color: theme.colors.text}]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                },
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              value={currentEditRequest?.email}
              onChangeText={text =>
                setCurrentEditRequest({...currentEditRequest, email: text})
              }
            />

            <Text style={[styles.label, {color: theme.colors.text}]}>Message</Text>
            <TextInput
              style={[
                styles.input,
                styles.messageInput,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                },
              ]}
              multiline
              numberOfLines={4}
              value={currentEditRequest?.message}
              onChangeText={text =>
                setCurrentEditRequest({...currentEditRequest, message: text})
              }
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  {borderColor: theme.colors.border},
                ]}
                onPress={() => setEditModalVisible(false)}>
                <Text style={[styles.modalButtonText, {color: theme.colors.text}]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  {backgroundColor: theme.colors.primary},
                ]}
                onPress={handleEditSubmit}>
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  requestsSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  requestCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  requestEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestDate: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ContactSupportScreen;