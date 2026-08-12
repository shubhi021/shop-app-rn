import authReducer, {
  logout,
  setError,
  setLoading,
  setUser,
} from '../src/store/slices/authSlice';
import {User} from '../src/types';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    isLoading: false,
    error: null,
  };

  const mockUser: User = {
    uid: 'user1',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const nextState = authReducer(initialState, setUser(mockUser));
    expect(nextState.user).toEqual(mockUser);
    expect(nextState.error).toBeNull();
  });

  it('should handle setUser to null', () => {
    const stateWithUser = authReducer(initialState, setUser(mockUser));
    const nextState = authReducer(stateWithUser, setUser(null));
    expect(nextState.user).toBeNull();
  });

  it('should handle setLoading', () => {
    const nextState = authReducer(initialState, setLoading(true));
    expect(nextState.isLoading).toBe(true);

    const falseState = authReducer(nextState, setLoading(false));
    expect(falseState.isLoading).toBe(false);
  });

  it('should handle setError', () => {
    const nextState = authReducer(
      {...initialState, isLoading: true},
      setError('An error occurred'),
    );
    expect(nextState.error).toBe('An error occurred');
    expect(nextState.isLoading).toBe(false);
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: mockUser,
      isLoading: false,
      error: 'Some error',
    };
    const nextState = authReducer(loggedInState, logout());
    expect(nextState.user).toBeNull();
    expect(nextState.error).toBeNull();
  });
});
