const ytdl = require ('ytdl-core');
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.DISCORD_API_KEY);

// ALL allowed exts need to be 4 characters to allow for playing of 4-length extensions, until I think of a better solution(if there is one).
const allowedExtensions = [".MP3", ".OGG", ".WAV", "FLAC", "MIDI", ".WMA"]
const prefix = ".";
const streamVolume = 0.25;


client.on('message', (message) => {
	let args = message.content.split(" ").slice(1);

	// If there are any attachments, check if they are playable audio files.
	if(message.attachments.first())
		checkToPlayAttachment(message);

	// List of commands.

	if(message.content.startsWith(prefix + "trump")) 
	{
		trump(message, args);	
	}
	else if(message.content.startsWith(prefix + "play")) 
	{
		play(message, args);
	}
	else if(message.content.startsWith(prefix + "stop")) 
	{
		stop(message, args);
	}
});

function checkToPlayAttachment(message)
{
	// Gets the URL of the attachment to check if it's an audio URL, and if it is, start a stream with it.
	let streamURL = message.attachments.first().url;

	// Just double checking that the streamURL isn't undefined.
	if(streamURL)
	{
		// Checks if the stream is an audio stream.
		if(allowedExtensions.includes(streamURL.substr(streamURL.length - 4).toUpperCase()))
		{
			// Check if the person who uploaded the attachment is in a voice channel.
			if(message.member.voiceChannel) 
			{
				// Audio stream exists and member is in a channel, start the audio stream. 
				message.member.voiceChannel.join().then(connection => {
					let voiceDispatch = connection.playArbitraryInput(streamURL);
					voiceDispatch.setVolume(streamVolume);
				}).catch(console.log);
			}
			else
			{
				// If the uploader is not in a voice channel, let them know.
				message.channel.send("You need to be in a voice channel to play an audio file.");
			}
		}
	}
}

function trump(message, args)
{
	// Doing voice requires being in a voice channel. User not in a channel? Dont look at it.
	if(!message.guild) return; 
	
	// Nothing in the arguments section? Return. Don't waste our precious CPU cycles.
	if(!args[0]) 
	{
		message.channel.send("You need to specify something for Donald to say.");
		return;
	}

	// Creates the trump TTS url.
	let trumpURL = "http://api.jungle.horse/speak?v=trump&vol=1&s=";

	for(i = 0; i < args.length; i++) 
	{
		// Instead of spaces, ad %20 for a properly formed URl.
		trumpURL += args[i] + "%20";
	}

	// Member needs to be in channel, if not, berate them for it.
	if(message.member.voiceChannel) 
	{
		message.member.voiceChannel.join().then(connection => {
			let voiceDispatch = connection.playArbitraryInput(trumpURL);
			voiceDispatch.setVolume(streamVolume);
		}).catch(console.log);
	}
	else
	{
		message.channel.send("You need to be in a voice channel to make Donald say something.");
	}
}

function play(message, args) 
	// Do the same checks on all voice commands.
	if(!message.guild) return; 

	if(!args[0])
	{
		message.channel.send("You need to put a URL to play from.");
		return;
	}

	let ytdlStream = ytdl(args[0], {
		filter : 'audioonly',
	});

	if(message.member.voiceChannel) 
	{
		message.member.voiceChannel.join().then(connection => {
			let voiceDispatch = connection.playStream(ytdlStream);
			voiceDispatch.setVolume(streamVolume);
		}).catch(console.log);
	}
	else
	{
		message.channel.send("You need to be in a voice channel to play something.");
	}
	
}

function stop(message, args)
{
	message.member.voiceChannel.leave();
}