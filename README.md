Design Decisions
	• Single Page App
		○ Created the program as a (nearly) single page app.  To get the feeling of a fast, high-end 8-bit game, nearly everything is in the single index.html file
		○ Why?
			§ Cartridge based games didn't not have any load times.
			§ Let's me load the whole game at once.
		○ How?
			§ The main div is id=main.  Every section under it is a "page".
			§ activateSection(); <-- hence the name
				□ By doing document.getElementById("main").children in a loop, and then setting each element as display: none, I can hide every part of the game I don't want to display.  
				□ I can then activate just the one child I want to display. 
			§ This gives the illusion of instant load times
		○  Exceptions
			§ Avatar upload part is in separate files.
			§ The level creator is in separate files.  But this is inconsequential, due to the fact that the general user will never get to touch the level creator.
	• Game Modes
		○ All modes only play 3 levels
		○ Arcade
			§ I only account for not hitting the error limits in arcade mode.  So I don't display the duration/time when that is completed.
		○ Time Trial
			§ If you beat all 3 levels in under 30 minutes, the time remaining will display.  This fullfils requirement "Part 1 #7"
	• Level Creator
		○ The level creator can be found at https://www.rivera-web.com/nonogram/level_creator.html
		○ This is the only place where the random level creator can be used
		○ The level creator, while it can be used with a mobile device, is more suited for a desktop
		○ You can also view the levels here to figure out how to beat the levels
	• High Scores
		○ Where are they?
		○ Just don't touch anything after hitting "start game", they will cycle automatically, just like an old arcade game.
		○ 	
			
		○ I skipped the part where I change the order.  That didn't really make any sense for what I was going for, the style of an old arcade game.  That is just a simple matter of running the array backwards in JS or doing a select .. asc  or select .. desc in MySQL
	• Trusting the Client
		○ Because it was really outside of the scope of the project, I don't have much, if anything, in the way of preventing a savvy programmer from messing with their score, or other things.  
		○ Things I could of done:
			§ The simplest thing would be to obfuscate the code.  
				□ But this prevents the instructor from easily see what is going on
			§ I could of implemented server side timers and score keepers
				□ But this would required extra tables or file operations that are not spec'd for this project.
		○ So I just didn't do anything.
	• Image Uploads
		○ The user avatar is client-to-server, stored for reuse.
		○ The 'upload' for the levels is pure javascript, because I've never done it that way before and I wanted to learn how to use it.
			§ Links to from sources is always volatile, but I still chose to do it, as an education exercise.
		
	• Suggestion tool
		○ So here's the thing.  I don't really care for the game, and I'm not good at it.  The examples of suggestions from other games online don't really tell me much, and often times their suggestion didn't really help me.  
		○ I wanted to make my tool better, but, I don't think I can.  So what I did was ..
			§ Find a marked square
				□ Count squares around it that are unmarked.  This is the most unique marked square, so it's useful.
			§ Find an unmarked square
				□ Count squares around it that are marked.  This is the most unique unmarked square, so it's also useful.
		○ I made it just one suggestion per level
	• Colors / Themes
		○ Instead of using a color picker, I choose to use themes.  
			§ Why?
			§ I want my game to look nice at all times.
			§ I hope it's appreciated that this method is harder than just a color picker.
	• No Small Screens for 13x13
		○ No mobile or any other small screens for 13x13.  The game option will be hidden by CSS AND JS.
	• Ending Credits
		○ This is where I talk about myself and the game, as per requirement "Webpages must contain: # 5"
	• Hacking the game
		○ to skip actually playing the game, you can run some special functions
			§ forceWin()
				□ beat the current level
			§ forceCredits()
				□ beat the game
			§ forceTimeout()
				□ force the timer to runout early.
	
