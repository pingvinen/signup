Simplii signup
==============

Installing toolchain on Ubuntu
------------------------------

```
sudo apt-get install ruby ruby-dev
git clone git@github.com:Simplii-mx/signup.git
cd signup
sudo gem install bundler
bundle install
```


Generating the site
-------------------

```
bundle exec middleman build
```


Running the site during development
-----------------------------------

```
bundle exec middleman server
```
