module.exports = {
  apps: [
    {
      name: 'rnsconnect-server',
      script: './server/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'client/dist'],
      max_memory_restart: '500M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      merge_logs: true
    }
  ]
};
