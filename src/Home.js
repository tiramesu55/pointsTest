import React from 'react';
import {Component} from 'react';

// eslint-disable-next-line no-unused-vars
import {Platform, StyleSheet, View} from 'react-native';
import BackgroundGeolocation, {
  Location,
  MotionChangeEvent,
  ProviderChangeEvent,
  HttpEvent,
  HeartbeatEvent,
  MotionActivityEvent,
} from 'react-native-background-geolocation';
import DeviceInfo from 'react-native-device-info';
import {
  Container,
  Header,
  Content,
  Footer,
  Left,
  Body,
  Right,
  Card,
  CardItem,
  Text,
  H1,
  Switch,
  Button,
  Icon,
  Title,
  StyleProvider,
} from 'native-base';
const TRACKER_HOST =
  'https://us-central1-mountain-ace.cloudfunctions.net/locations';
export default class Home extends Component {
  static navigationOptions = {title: 'home'};
  constructor(props) {
    super(props);
    this.navigation = this.props.navigation;
    this.state = {
      enabled: false,
      isMoving: false,
      events: [],
    };
  }
  addEvent(name, date, object) {
    let event = {
      key: this.eventId++,
      name: name,
      timestamp: date.toLocaleTimeString(),
      json: JSON.stringify(object, null, 2),
    };
    /*this.setState({
      events: [...this.state.events, event],
    });*/
  }

  onHttp(response) {
    console.log('[event] http: ', response);
    this.addEvent('http', new Date(), response);
  }
  onHeartbeat(event) {
    console.log('[event] heartbeat: ', event);
    this.addEvent('heartbeat', new Date(), event);
  }
  onToggleEnabled() {
    const enabled = !this.state.enabled;
    this.setState({
      enabled: enabled,
      isMoving: false,
    });
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
    }
  }
  componentDidMount() {
    BackgroundGeolocation.reset();
    BackgroundGeolocation.onHttp(this.onHttp.bind(this));
    BackgroundGeolocation.onHeartbeat(this.onHeartbeat.bind(this));
    BackgroundGeolocation.onConnectivityChange(event => {
      console.log('[event] connectivityChange: ', event);
      this.addEvent('connectivity Change', new Date(), event);
    });
    const id = DeviceInfo.getDeviceId();
    BackgroundGeolocation.ready(
      {
        // preventSuspend: true,  //play with that.  It may not be necessary
        distanceFilter: 10,
        stopOnTerminate: false,
        //startOnBoot: true,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        stopTimeout: 5, //wait 5 min before stopping if still
        maxDaysToPersist: 1,
        foregroundService: true,
        heartbeatInterval: 60,
        url: TRACKER_HOST,
        params: {
          // Required for tracker.transistorsoft.com
          device: {
            uuid: id,
            model: DeviceInfo.getModel(),
            platform: DeviceInfo.getSystemName(),
            manufacturer: 'Apple',
            version: '1',
            framework: 'woi',
          },
        },
        autoSync: true,
        debug: false, //true,
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        logMaxDays: 1,
      },
      state => {
        console.log('- Configure success: ', state);
        this.setState({
          enabled: state.enabled,
          isMoving: state.isMoving,
        });
      },
    );
  }
  goTrailPress = () => {
    this.onToggleEnabled();
    this.navigation.navigate('Trails');
  };
  render() {
    return (
      <Container>
        <Right>
          <Switch
            onValueChange={() => this.onToggleEnabled()}
            value={this.state.enabled}
          />
        </Right>
        <Card>
          <Button block info onPress={this.goTrailPress}>
            <Text> Trails </Text>
          </Button>
        </Card>
        <Card>
          <Button
            block
            info
            onPress={() => this.navigation.navigate('Settings')}>
            <Text> Settings </Text>
          </Button>
        </Card>
      </Container>
    );
  }
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fedd1e',
  },
  title: {
    color: '#000',
  },
  body: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#272727',
  },
  h1: {
    color: '#fff',
    marginBottom: 20,
  },
  p: {
    fontSize: 12,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginBottom: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  footer: {
    backgroundColor: 'transparent',
    height: 215,
  },
  userInfo: {
    padding: 10,
  },
});
