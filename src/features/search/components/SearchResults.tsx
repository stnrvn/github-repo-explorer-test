import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../searchSlice';
import {
  selectSearchUsers,
  selectSearchStatus,
  selectSelectedUser,
} from '../selectors';
import { Skeleton } from '@/components/ui/Skeleton';
import { GitHubUser } from '@/types/github';

const UserSkeleton = () => (
  <div className="flex items-center space-x-4 p-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const SearchResults = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectSearchUsers);
  const status = useSelector(selectSearchStatus);
  const selectedUser = useSelector(selectSelectedUser);

  if (status === 'loading') {
    return (
      <div className="mt-4">
        <div className="bg-gray-900 rounded-lg divide-y divide-gray-700/50">
          {Array.from({ length: 3 }).map((_, index) => (
            <UserSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="bg-gray-900 rounded-lg divide-y divide-gray-700/50">
        {users.map((user: GitHubUser) => (
          <button
            key={user.id}
            className={`w-full flex items-center p-4 transition-colors text-left focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-0 hover:border-0 border-0 ring-0 ${
              selectedUser?.id === user.id ? 'bg-gray-800' : 'bg-gray-800/50'
            } hover:bg-gray-800`}
            onClick={() => dispatch(selectUser(user))}
          >
            <img
              src={user.avatar_url}
              alt={`${user.login}'s avatar`}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-4">
              <div className="font-medium text-white">{user.login}</div>
              <div className="text-sm text-gray-400">View repositories</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 