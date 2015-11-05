cash
====
cash is a templating language for the command line.

What separates cash from other templating languages is that contextual data is
provided via command-line arguments. This makes cash ideal for writing complex
templating scripts in bash or other programming languages or environments that
don't have proper data types.

Example usage
-------------
header.cash:

	{title} | My awesome blog post
	{publishedDate}

body.cash:

	Hello, {nonexistent}!

	{articleContent}

blogpost.markdown:

	Awesome Blog
	============
	This is my first blog post. Hello, world!

footer.cash

	---
	My awesome blog, (c) {year}. Follow me on \{twitter\}
	List of writers: {[]writers}{}{/writers}.

Command line:

	$ cash --title "Learn cash in one easy step!" \
	       --publishedDate "`date`" \
	       -articleContent blogpost.md \
	       --year "2015" \
	       -writers [chrisdotcode,"Chris Blake"] \
	       header.cash \
	       body.cash \
	       footer.cash

Output:

	Learn cash in one easy step! | My awesome blog post
	Wed Nov  4 23:12:49 EST 2015
	Hello, !

	Awesome Blog
	============
	This is my first blog post. Hello, world!
	---
	My awesome blog, (c) 2015. Follow me on {twitter}
	List of writers: chrisdotcode,Chris Blake,.

Install
-------
Globally:

	sudo npm install cash-template -g
