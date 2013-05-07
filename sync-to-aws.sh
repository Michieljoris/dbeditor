rsync --verbose  --progress --stats --compress --rsh=/usr/bin/ssh --recursive --times --perms --links --delete --exclude "*bak" --exclude "*~" --exclude ".git" ~/www/sites/dbeditor/ ubuntu@aws:~/www/dbeditor










