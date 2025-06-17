import { describe, test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
// 1. Importe o AuthContext real, não o hook.
import { AuthContext } from '@/contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock do useRouter (esta parte está correta)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Não precisamos mais de jest.mock para o AuthContext

describe('LoginPage', () => {
  // Não precisamos mais de beforeEach para limpar mocks desta forma

  test('should display an error message on failed login', async () => {
    // Arrange
    // 2. Crie um objeto de mock para o valor do contexto.
    // Este objeto simula exatamente o que o hook 'useAuth' retornaria.
    const mockAuthContextValue = {
      login: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
      isLoading: false,
      isAuthenticated: false,
      user: null,
      taskUpdateTrigger: 0,
      triggerTaskUpdate: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    };

    // Render Login Page with mocked context
    
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <LoginPage />
      </AuthContext.Provider>
    );

    // Act
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    fireEvent.click(loginButton);

    // Assert
    // Verify if login function was called with mocked email and password
    expect(mockAuthContextValue.login).toHaveBeenCalledWith('wrong@test.com', 'wrongpassword');

    // Verify displayed message
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });
});