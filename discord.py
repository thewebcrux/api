import discord
from discord.ext import commands
#wbcrx
client = commands.Bot(command_prefix='!')

@client.event
async def on_ready():
    print('Logged in as {0.user}'.format(client))

@client.command()
async def ping(ctx):
    await ctx.send('Pong!')

client.run('your_token_here')
