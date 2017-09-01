import click
from datetime import datetime
from screepsdashboard.services import esconsole
from screepsdashboard.services import screeps
import time

@click.group()
@click.pass_context
def cli(ctx):
    if ctx.parent:
        print(ctx.parent.get_help())

@cli.command(short_help="Stream the Screeps console to stdout")
@click.option('--start_at', default='now-1m')
def stream(start_at):
    message_time = start_at
    while True:
        messages = esconsole.get_records(message_time)
        if 'message' not in messages or len(messages['message']):
            time.sleep(1.5)
        for message in messages:
            message_time = datetime.strptime(message['timestamp'],"%Y-%m-%dT%H:%M:%S.%f")
            if 'tick' in message:
                print('#%s %s: %s' % (message['tick'], message['group'], message['message']))
            else:
                print(message['message'])
            time.sleep(0.05)


@cli.command(short_help="Stream the Screeps console to elasticsearch")
def log():
    screeps.import_socket()
    pass


if __name__ == '__main__':
    cli()
