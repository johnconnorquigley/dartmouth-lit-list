import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Button
} from 'react-native';
import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import {AzureInstance, AzureLoginView} from 'react-native-azure-ad-2';

/* LOADING SCREEN */
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

class HomeScreen extends React.Component {

  getMailAsync = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log(userToken);
      fetch("https://graph.microsoft.com/v1.0/me/messages", {
                      headers: {
                          'Authorization': "Bearer " + userToken,
                      }
              }).then(response => {
                  console.log(response);
                  return response.json()
              })
              .then(response => {
                  console.log(response);
                  return response
              }).catch(err => {
                  // incase of error reject promise
                  throw new Error(err);
              });


  }

  render(){
    this.getMailAsync();
    return(
      <View>
        <Text>Home Screen</Text>
        <Button title="Actually, sign me out :)" onPress={this._signOutAsync} />
        <Text></Text>
      </View>
    )
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}

/* Azure Stuff */
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

    //instantiate azure objects with your azure CREDENTIALS

    //bind the login success function
		this._onLoginSuccess = this._onLoginSuccess.bind(this);
	}


  // function to be called after login is successful
	_onLoginSuccess(){
		Instance.getUserInfo().then(result => {
      console.log(result);
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
            	loadingMessage="Requesting access token"
            	onSuccess={this._onLoginSuccess}
            />
        );
    }
}





/* Main Navigation */
const AppStack = createStackNavigator({ Home: HomeScreen });
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
