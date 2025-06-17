// src/app/(app)/tasks/tasks.test.tsx

import { describe, test, expect, jest, afterEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import TasksPage from './page';
// 1. Importamos o AuthContext real para usar seu Provider.
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/services/api'; // Precisamos do 'api' para mockar a chamada.
import '@testing-library/jest-dom';

// Mock do useRouter (necessário porque nosso AuthContext o utiliza).
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('TasksPage', () => {

  // Limpa os "espiões" após cada teste para garantir isolamento.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should fetch and display a list of tasks for an authenticated user', async () => {
    // Arrange: Preparamos nosso cenário.

    // 2. Criamos um objeto de mock para o valor do contexto.
    const mockAuthContextValue = {
      isAuthenticated: true, // Simulamos que o usuário está logado.
      isLoading: false,      // Simulamos que o carregamento inicial já terminou.
      user: { username: 'testuser', email: 'test@test.com', first_name: 'Test', last_name: 'User' },
      taskUpdateTrigger: 0,
      // Fornecemos funções de mock vazias para as outras propriedades do contexto.
      triggerTaskUpdate: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    };

    // 3. Preparamos a lista de tarefas que a API "retornará".
    const mockTasks = [
      { id: 1, title: 'First Test Task', description: 'Desc 1', status: 'PENDING', due_date: null, owner: 'testuser', created_at: '', updated_at: '' },
      { id: 2, title: 'Second Test Task', description: 'Desc 2', status: 'COMPLETED', due_date: null, owner: 'testuser', created_at: '', updated_at: '' },
    ];

    // 4. Criamos um "espião" na função 'get' do nosso 'api' (axios)
    // e dizemos a ele para retornar nossas tarefas mockadas.
    const apiGetSpy = jest.spyOn(api, 'get').mockResolvedValue({
      data: { results: mockTasks },
    });
    
    // Act: Renderizamos a página, "envelopando-a" com nosso Provider mockado.
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <TasksPage />
      </AuthContext.Provider>
    );

    // Assert: Verificamos os resultados.

    // Esperamos que a função de busca da API tenha sido chamada com a URL correta.
    expect(apiGetSpy).toHaveBeenCalledWith('/tasks/?');

    // Usamos waitFor para esperar que a UI se atualize com os dados da API.
    await waitFor(() => {
      // Verificamos se o título de cada uma das nossas tarefas mockadas aparece na tela.
      expect(screen.getByText('First Test Task')).toBeInTheDocument();
      expect(screen.getByText('Second Test Task')).toBeInTheDocument();
    });
  });
});