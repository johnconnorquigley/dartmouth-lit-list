import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Button,
  Image,
  FlatList,
  TouchableHighlight,
  ScrollView,
  WebView
} from 'react-native';
import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import {AzureInstance, AzureLoginView} from 'react-native-azure-ad-2';


/**************************** LOADING SCREEN ***********/
class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  // Render any loading content that you like here
  render() {

    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

/******************************* Home Screen *********************************/
const GREEKS = [
  "Gamma.Delta.Chi@DARTMOUTH.EDU",
  "Beta.Alpha.Omega@DARTMOUTH.EDU",
  "Kappa.Kappa.Kappa@DARTMOUTH.EDU",
  "Chi.Gam.Epsilon@DARTMOUTH.EDU",
  "Alpha.Chi.Alpha@DARTMOUTH.EDU",
  "Sigma.Nu@DARTMOUTH.EDU",
  "Sigma.Phi.Epsilon@DARTMOUTH.EDU",
  "Zeta.Psi.Upsilon@DARTMOUTH.EDU",
  "bones.gate@DARTMOUTH.EDU",
  "phi.delta.alpha@dartmouth.edu",
  "chi.heorot@dartmouth.edu",
  "theta.delta.chi@dartmouth.edu",
  "alpha.phi@dartmouth.edu",
  "alpha.xi.delta@dartmouth.edu",
  "chi.deta@dartmouth.edu",
  "epsilon.kappa.theta@dartmouth.edu",
  "kappa.delta@dartmouth.edu",
  "kappa.delta.epsilon@dartmouth.edu",
  "kappa.kappa.gamma@dartmouth.edu",
  "sigma.delta@dartmouth.edu",
  "Interfraternity.Council@DARTMOUTH.EDU"
];

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      eventList: undefined,
    }
  }

  static navigationOptions = {
   title: 'Greek Events',
   headerStyle: {
      backgroundColor: '#00693e',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  getMailAsync = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      fetch("https://graph.microsoft.com/v1.0/me/messages?top=900", {
                      headers: {
                          'Authorization': "Bearer " + userToken,
                      }
              }).then(response => {
                  return response.json()
              })
              .then(response => {
                  this.getResults(response);
                  return response
              }).catch(err => {
                  this._signOutAsync();
                  // incase of error reject promise
                  throw new Error(err);
              });
  }

  //get the results of the response
  getResults(response) {
    //get array of emails
    var values = response.value;

    //get emails from last 5 days, could allow user to specify date range
    var today = new Date();
    var startDate = new Date(today.getTime() - 5*24*60*60*1000);
    function filterByDate(value, index, array){
      if(Date.parse(value.receivedDateTime) != undefined) {
        return Date.parse(value.receivedDateTime) >= startDate;
      }
      return false;
    }
    // values = values.filter(filterByDate);

    //filter by fraternity
    function filterByFrat(value, index, array){
        return value.from.emailAddress.address != undefined && GREEKS.indexOf(value.from.emailAddress.address) >= 0;
    }
    values = values.filter(filterByFrat);
    this.setState(previousState => {
        return { isLoading: !previousState.isLoading, eventList: values};
      });
  }

    //stuff to render the list
  _renderItem = ({item}) => (
     <MyListItem
       item={item}
       navigation = {this.props.navigation}
       // selected={!!this.state.selected.get(item.id)}
       title={item.from.emailAddress.address}
     />
   );

   _keyExtractor = (item, index) => item.id;

   //render the component
  render(){
    if(this.state.isLoading) {
      this.getMailAsync();
      return(
        <View style={[styles.container, {backgroundColor: '#fff', justifyContent: 'center'}]}>
          <ActivityIndicator size="large" color="#00693e"/>
        </View>
      )
    } else {
      return(
        <View style={[styles.container, {backgroundColor: '#fff'}]}>
          <View style={{flex: 10}}>
            <FlatList
              data={this.state.eventList}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          </View>
          <View style={{flex: 1, backgroundColor: '#00693e'}}>
            <Button title="Sign Out" color='#fff' onPress={this._signOutAsync} />
          </View>
        </View>
      )
    }
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}


/**************** view the email content ***********************/
class MessageScreen extends React.Component {

  static navigationOptions = ({navigation}) => {
   return {title: navigation.getParam('subject', 'Message'),
   headerStyle: {
      backgroundColor: '#00693e',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },}
  };

  render() {
    const html = this.props.navigation.getParam('content','no');
    return(
        <WebView source={{html, baseUrl: 'web/'}} mixedContentMode='always' style={{ flex: 1 }}/>



    )
  }
}

/************************ List Item **********************************/
class MyListItem extends React.PureComponent {
  _onPress = () => {
    console.log(this.props.item);
    this.props.navigation.push('Message', {
      subject: this.props.item.subject,
      sender: this.props.item.from.emailAddress.name,
      content: this.props.item.body.content
    });
  }

  render() {
    const item = this.props.item;
    return (
      <TouchableHighlight
          onPress={this._onPress}
          underlayColor='#dddddd'>
          <View>
            <View style={[styles.rowContainer, {backgroundColor: '#fff'}]}>
              <View style={styles.textContainer}>
                <Text style={styles.name}>{item.subject }</Text>
                <Text >{item.from.emailAddress.name}</Text>
              </View>
            </View>
            <View style={styles.separator}/>
          </View>
        </TouchableHighlight>
    );
  }
}

/************************ Azure Stuff *********************/
const CREDENTIALS = {
  client_id: 'f1aeeadd-f89c-43e9-a71e-b3845370643d',
  client_secret: 'bnzhRTNIB1035ybjAT4**;#',
  scope: 'User.ReadBasic.All Mail.Read' //access scope for login - see http://bit.ly/2gtQe9W for more info
};
const Instance = new AzureInstance(CREDENTIALS);


//create a component for Azure Authentication
class azureAuth extends React.Component {
	constructor(props){
		super(props);

    //bind the login success function
		this._onLoginSuccess = this._onLoginSuccess.bind(this);
	}

  static navigationOptions = {
   title: 'Sign In',
   headerStyle: {
      backgroundColor: '#00693e',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  // function to be called after login is successful
	_onLoginSuccess(){
		Instance.getUserInfo().then(result => {
      this._signInAsync()
		}).catch(err => {
			console.log(err);
		})
	}

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', Instance.getToken()["accessToken"]);
    this.props.navigation.navigate('App');
  };

  // pass the azureInstance and Login Success function to the AzureLoginView that will display
  // the authentication screen
    render() {
        return (
            <AzureLoginView
            	azureInstance={Instance}
            	loadingMessage="Retreiving Mail ..."
            	onSuccess={this._onLoginSuccess}
            />
        );
    }
}

/* Main Navigation */
const AppStack = createStackNavigator({ Home: HomeScreen, Message: MessageScreen});
const AuthStack = createStackNavigator({ SignIn: azureAuth });

export default createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
);


/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#00693e'
  },

  thumb: {
    width: 80,
    height: 80,
    marginRight: 10
  },
  textContainer: {
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd'
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#48BBEC'
  },
  title: {
    fontSize: 20,
    color: '#656565'
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10
  },
});
