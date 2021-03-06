import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Text, Input as KittenInput, Select } from '@ui-kitten/components';
import { KeyboardAvoidingView, TouchableOpacity, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase';
import { DARK_BLUE } from '../../styles/colours';

class UpdateChoreScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      backgroundColor: 'white'
    },
    headerLeft: () => {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="ios-arrow-back"
            size={30}
            color={DARK_BLUE}
            style={{ paddingHorizontal: 16 }}
          />
        </TouchableOpacity>
      );
    },
    headerTitle: () => <Text style={{ fontWeight: 'bold' }}>Edit Chore</Text>
  });

  constructor(props) {
    super(props);

    // create ref to first input to load keyboard upon
    // navigating to screen
    this.firstInput = React.createRef();
    const { allUsersInGroup, currentChore } = props;

    // create deep clone copy of currentChore
    const choreCopy = JSON.parse(JSON.stringify(currentChore));

    // get all users
    const users = allUsersInGroup.map(user => {
      /*
        match user based on those already assigned to this chore.
        we do this so we can get the current 'count' if the user
        is already assigned to this chore.
      */

      const matchingUser = choreCopy.responsibility.find(el => user.id === el.user.id);
      return {
        text: user.name.firstName,
        id: user.id,
        count: matchingUser ? matchingUser.count : 0 // get current count if it exists
      };
    });

    /*
      selectedUsers need to be derived from the same
      users[] array so that the <Select /> component works properly.

      if you care about this just ask me what the error was lol
    */
    const selectedUsers = choreCopy.responsibility.map(user => {
      const matchingUser = users.find(el => el.id === user.user.id);
      return matchingUser;
    });

    this.state = {
      users,
      selectedUsers,
      choreName: choreCopy.name
    };
  }

  componentDidMount() {
    this.firstInput.current.focus();
  }

  setSelectedOption = user => { };

  onChoreNameChange = choreName => {
    this.setState({ choreName });
  };

  updateChore = updatedFields => {
    const { currentChore, navigation } = this.props;

    firebase
      .firestore()
      .collection('chores')
      .doc(currentChore.id)
      .update(updatedFields)
      .then(() => {
        navigation.navigate('chore');
      });
  };

  onCheckmarkPress = async () => {
    const { choreName, selectedUsers } = this.state;

    // get user references
    const selectedUsersWithRef = await Promise.all(
      selectedUsers.map(async el => {
        const userRef = await firebase
          .firestore()
          .collection('users')
          .doc(el.id);

        return {
          userRef,
          count: el.count ? el.count : 0
        };
      })
    );

    const updatedFields = {
      name: choreName,
      responsibility: selectedUsersWithRef
    };

    this.updateChore(updatedFields);
  };

  render() {
    const { choreName, users, selectedUsers } = this.state;
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behaviour="height" enabled>
        <Layout style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            scrollEnabled={false}
          >
            <KittenInput
              label="Name"
              placeholder="Chore name"
              onChangeText={this.onChoreNameChange}
              value={choreName}
              ref={this.firstInput}
              style={{
                fontSize: 16,
                backgroundColor: '#f0eeee',
                width: '60%'
              }}
              size="large"
              autoCorrect={false}
            />
            <Select
              label="Assign"
              data={users}
              selectedOption={selectedUsers}
              onSelect={this.setSelectedOption}
              multiSelect
              style={styles.input}
            />
            <Layout
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                width: '60%',
                margin: 20
              }}
            >
              <TouchableOpacity>
                <Ionicons name="md-close" size={40} color="red" />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.onCheckmarkPress}>
                <Ionicons name="md-checkmark" size={40} color="green" />
              </TouchableOpacity>
            </Layout>
          </ScrollView>
        </Layout>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    width: '60%'
  }
});

const mapStateToProps = ({ chore, auth }) => {
  const { currentChore } = chore;
  const { allUsersInGroup } = auth;

  return { currentChore, allUsersInGroup };
};
export default connect(mapStateToProps, null)(UpdateChoreScreen);
