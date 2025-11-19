import {StyleSheet, Text, View} from 'react-native';
import React, {createContext, useState} from 'react';
interface AuthContextType {
  user: object | null;
  userToken: string | null;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  userToken: null,
});
const AuthProvider = ({children}: {children: any}) => {
  const [user, setUser] = useState<object | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  return (
    <AuthContext.Provider value={{user: user, userToken: userToken}}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthProvider, AuthContext};

const styles = StyleSheet.create({});
