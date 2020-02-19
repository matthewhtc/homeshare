import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import { Button } from 'react-native-elements';

import {
  emailChanged,
  fnameChanged,
  lnameChanged,
  usernameChanged,
  signupUser,
  clearErrors
} from '../actions';
import AuthStyles from '../styles/auth';
import { Layout } from '@ui-kitten/components';
import { DARK_BLUE } from '../styles/colours';

class ProfileScreen extends Component {
  renderGroupInfo = () => {
    if (this.props.inGroup) {
      return (
        <View>
          <Text style={AuthStyles.subTitle}>Group Details</Text>
          <Text>Name: {this.props.groupInfo.name}</Text>
          <Text>address: {this.props.groupInfo.address}</Text>
        </View>
      );
    }
  };

  renderButton = () => {
    let title;
    if (this.props.inGroup) {
      title = 'Leave Group';
    } else {
      title = 'Create Group';
    }
    return (
      <Button
        title={title}
        buttonStyle={{
          borderRadius: 5,
          padding: 10,
          backgroundColor: DARK_BLUE
        }}
        titleStyle={{
          width: '90%',
          fontSize: 20
        }}
        onPress={this.onButtonPress}
      />
    );
  };

  onButtonPress = () => {
    if (this.props.inGroup) {
      console.log('yay');
    } else {
      this.props.navigation.navigate('createGroup');
      console.log('not in group');
    }
  };

  render() {
    return (
      <Layout style={AuthStyles.container}>
        <View>
          <Text style={AuthStyles.subTitle}>User Profile</Text>
          <Text>First Name: {this.props.firstName}</Text>
          <Text>Last Name: {this.props.lastName}</Text>
          <Text>Email: {this.props.email}</Text>
          <Text>Username: {this.props.username}</Text>
          {this.renderGroupInfo()}
          {this.renderButton()}
        </View>
      </Layout>
    );
  }
}

const mapStateToProps = ({ auth }) => {
  const {
    email,
    loading,
    firstName,
    lastName,
    username,
    user,
    inGroup,
    groupInfo
  } = auth;

  return {
    email,
    loading,
    firstName,
    lastName,
    username,
    user,
    inGroup,
    groupInfo
  };
};
export default connect(mapStateToProps, {
  emailChanged,
  fnameChanged,
  lnameChanged,
  usernameChanged,
  signupUser,
  clearErrors
})(ProfileScreen);
