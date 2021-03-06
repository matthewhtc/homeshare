import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Text } from '@ui-kitten/components';
import { Button } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase';
import { NavigationEvents } from 'react-navigation';
import HeaderCard from '../../components/HeaderCard';
import ItemCard from '../../components/ItemCard';
import Spinner from '../../components/Spinner';
import { viewPayment, retrievePayments } from '../../actions';
import { DARK_BLUE, ORANGE } from '../../styles/colours';

// import React, { Component } from 'react';
// import { View, Text, Button, FlatList } from 'react-native';

// class PaymentScreen extends Component {

//   create = () => {
//     PaymentFunctions.shared.createPayment();
//   };

//   update = () => {
//     PaymentFunctions.shared.updatePayment('vmZ2ZeGtzgxotVar4CXz', {
//       cost: 4,
//       name: 'updatedfood'
//     });
//   };
//   delete = () => {
//     PaymentFunctions.shared.deletePayment('vECUNTlwFY87pTK1ndqF');
//   };
//   render() {
//     return (
//       <View>
//         <FlatList
//           keyExtractor={item => item._id}
//           data={this.state.payments}
//           renderItem={({ item }) => {
//             return (
//               <View>
//                 <Text>
//                   ID: {item._id} name: {item.name} cost: {item.cost}
//                 </Text>
//               </View>
//             );
//           }}
//         />
//         <Button title="add" onPress={this.create} />
//         <Button title="read" onPress={this.read} />
//         <Button title="update" onPress={this.update} />
//         <Button title="delete" onPress={this.delete} />
//       </View>
//     );
//   }

//   componentDidMount() {
//     PaymentFunctions.shared.getPayments(payment => {
//       this.setState(previousState => {
//         return {
//           payments: [...previousState.payments, payment]
//         };
//       });
//     });
//   }

//   componentWillUnmount() {
//     PaymentFunctions.shared.off();
//   }
// }

// export default PaymentScreen;

class PaymentScreen extends Component {
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
    headerTitle: () => <Text style={{ fontWeight: 'bold' }}>Payments</Text>
  });

  constructor(props) {
    super(props);

    this.state = {
      balance: 0,
      paymentInfo: []
    };
  }

  componentDidMount() {
    this.retrievePaymentsHelper();
  }

  retrievePaymentsHelper = () => {
    const { group, retrievePayments } = this.props;
    firebase
      .firestore()
      .collection('payments')
      .where('group', '==', group)
      .get()
      .then(snapshot => {
        let payments = snapshot.docs.map(doc => {
          const { cost, date, name, owner, payees } = doc.data();

          const ownerDetails = payees.filter(payee => payee.user.id === owner);

          return {
            cost,
            date,
            name,
            owner: ownerDetails[0].user,
            payees,
            id: doc.id
          };
        });
        payments = payments.sort((a, b) => b.date - a.date);
        this.calculateBalance(payments);
        retrievePayments(payments);
      });
  };

  calculateBalance = payments => {
    const { user } = this.props;
    const paymentInfo = [];
    const balance = payments.reduce((totalBalance, currentPayment) => {
      // check if the currentPayment belongs to the logged in user
      const currentPaymentBalance = currentPayment.payees.reduce((currPaymentBalance, payee) => {
        let amount = 0;
        // first check if current payment belongs to owner
        if (currentPayment.owner.id === user) {
          if (payee.user.id !== user && !payee.isPaid) {
            amount = payee.amount;
          }
        } else if (payee.user.id === user && !payee.isPaid) {
          // you aren't the owner of the payment
          amount = -1 * payee.amount;
        }
        return currPaymentBalance + amount;
      }, 0);
      paymentInfo.push(currentPaymentBalance);
      return totalBalance + currentPaymentBalance;
    }, 0);

    this.setState({ balance, paymentInfo });
  };

  onPaymentPress = paymentId => {
    // get payment
    const { payments, viewPayment, navigation } = this.props;
    const selectedPayment = payments.find(payment => payment.id === paymentId);

    // dispatch action to set current payment being viewed
    viewPayment(selectedPayment.id);

    // navigate to ViewPaymentScreen
    navigation.navigate('readPayment');
  };

  renderPayments = () => {
    const { payments } = this.props;
    const { paymentInfo } = this.state;
    if (payments.length === 0) {
      return <Spinner size="small" colour={DARK_BLUE} />;
    }
    return payments.map((payment, index) => {
      return (
        <ItemCard
          key={payment.id}
          cost={payment.cost}
          name={payment.name}
          id={payment.id}
          onPress={this.onPaymentPress}
          owner={payment.owner}
          amount={paymentInfo[index]}
        />
      );
    });
  };

  render() {
    const { payments, navigation } = this.props;
    const { balance } = this.state;
    const headerCardSubtitle = balance >= 0 ? 'in total is owed to you.' : 'is the total you owe.';

    return (
      <Layout style={{ padding: 16, flex: 1, flexDirection: 'column' }}>
        <NavigationEvents onDidFocus={this.retrievePaymentsHelper} />
        <HeaderCard title={`$${Math.abs(balance)}`} subtitle={headerCardSubtitle} />
        <ScrollView
          vertical
          contentContainerStyle={[
            payments.length === 0 ? { justifyContent: 'center', alignItems: 'center' } : {}
          ]}
        >
          {this.renderPayments()}
        </ScrollView>
        <Button
          title="Add a payment"
          buttonStyle={{ backgroundColor: ORANGE }}
          onPress={() => {
            navigation.navigate('createPayment');
          }}
        />
      </Layout>
    );
  }
}

const mapStateToProps = ({ payment, auth }) => {
  const { payments } = payment;
  const { group, user } = auth;

  return { payments, group, user };
};
export default connect(mapStateToProps, { viewPayment, retrievePayments })(PaymentScreen);
