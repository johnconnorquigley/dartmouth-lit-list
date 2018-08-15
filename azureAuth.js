import React from 'react';
import { StyleSheet, Text, View, AsyncStorage} from 'react-native';
import {AzureInstance, AzureLoginView} from 'react-native-azure-ad-2';

const CREDENTIALS = {
  client_id: 'f1aeeadd-f89c-43e9-a71e-b3845370643d',
  client_secret: 'bnzhRTNIB1035ybjAT4**;#',
  scope: 'User.ReadBasic.All Mail.Read' //access scope for login - see http://bit.ly/2gtQe9W for more info
};

const Instance = new AzureInstance(CREDENTIALS);

//create a component for Azure Authentication
export default class azureAuth extends React.Component {
	constructor(props){
		super(props);

    //instantiate azure objects with your azure CREDENTIALS
    // Instance = new AzureInstance(CREDENTIALS);
    console.log(Instance);

    //bind the login success function
		this._onLoginSuccess = this._onLoginSuccess.bind(this);
	}


  // function to be called after login is successful
	_onLoginSuccess(){
		Instance.getUserInfo().then(result => {
      console.log(result);

		}).catch(err => {
			console.log(err);
		})
	}

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
