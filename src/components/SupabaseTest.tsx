'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError('');
      
      // List of tables that should exist after migration
      const expectedTables = [
        'users',
        'learner_profiles', 
        'diagnostic_results',
        'diagnostic_responses',
        'learning_progress',
        'lesson_completions',
        'mastery_tracking',
        'plan_generations',
        'subscriptions'
      ];

      const foundTables: string[] = [];
      const missingTables: string[] = [];

      // Test each table individually
      for (const tableName of expectedTables) {
        try {
          const { error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (tableError) {
            if (tableError.message.includes('does not exist')) {
              missingTables.push(tableName);
            } else {
              // Table exists but might have other permissions issues
              foundTables.push(tableName);
            }
          } else {
            foundTables.push(tableName);
          }
        } catch (err) {
          missingTables.push(tableName);
        }
      }

      if (foundTables.length === 0) {
        setError('No database tables found. Need to run SQL migration in Supabase.');
        setConnectionStatus('error');
        return;
      }

      if (missingTables.length > 0) {
        setError(`Missing tables: ${missingTables.join(', ')}. Migration may be incomplete.`);
      }

      setTables(foundTables);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Supabase test error:', err);
      setError(`Unexpected error: ${err}`);
      setConnectionStatus('error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Supabase Connection Test
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {connectionStatus === 'testing' ? 'Testing connection...' :
             connectionStatus === 'connected' ? 'Connected successfully!' : 'Connection failed'}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {connectionStatus === 'connected' && tables.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              Database tables found ({tables.length}/9):
            </p>
            <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
              {tables.map(table => (
                <li key={table}>• {table}</li>
              ))}
            </ul>
            {tables.length === 9 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                ✅ All tables created successfully!
              </p>
            )}
          </div>
        )}

        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Test Again
        </button>
      </div>
    </div>
  );
}
