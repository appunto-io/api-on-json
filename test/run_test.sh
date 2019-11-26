open test/launch_rethink.command
sleep 60
npm run tests
rm -r ~/rethinkdb_data/
