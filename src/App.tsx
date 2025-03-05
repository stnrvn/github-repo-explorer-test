import { Provider } from 'react-redux';
import { store } from './store';
import { SearchInput } from './features/search/components/SearchInput';
import { SearchResults } from './features/search/components/SearchResults';
import { RepositoryList } from './features/repositories/components/RepositoryList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSelector } from 'react-redux';
import { selectSelectedUser } from './features/search/selectors';

function AppContent() {
  const selectedUser = useSelector(selectSelectedUser);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 overflow-auto">
      <header className="flex-none bg-gray-800 shadow">
        <div className="px-4 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            GitHub Repositories Explorer
          </h1>
        </div>
      </header>

      {selectedUser ? (
        <div className="flex-1 flex flex-col lg:flex-row">
          <aside className="w-full lg:w-80 flex-none bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-800">
            <div className="p-4">
              <ErrorBoundary>
                <div className="lg:sticky lg:top-4">
                  <SearchInput />
                  <div className="mt-4 rounded-none">
                    <SearchResults />
                  </div>
                </div>
              </ErrorBoundary>
            </div>
          </aside>
          <main className="flex-1 bg-gray-900">
            <div className="p-4">
              <ErrorBoundary>
                <RepositoryList />
              </ErrorBoundary>
            </div>
          </main>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
          <div className="w-full max-w-md">
            <ErrorBoundary>
              <div className="space-y-4">
                <SearchInput />
                <SearchResults />
              </div>
            </ErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
