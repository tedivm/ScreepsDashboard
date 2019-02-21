# Always prefer setuptools over distutils
from setuptools import setup, find_packages
# To use a consistent encoding
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

try:
    import pypandoc
    long_description = pypandoc.convert('README.md', 'rst')
except(IOError, ImportError):
    long_description = open('README.md').read()


version = '0.3.0'
setup(

  name = 'screepsdashboard',

  version = version,
  packages=find_packages(),

  description = '',
  long_description=long_description,
  python_requires='>=3',

  author = 'Robert Hafner',
  author_email = 'tedivm@tedivm.com',
  url = '',
  download_url = "/archive/v%s.tar.gz" % (version),
  keywords = '',

  classifiers = [
    'Development Status :: 4 - Beta',
    'License :: OSI Approved :: MIT License',

    'Programming Language :: Python :: 3',
    'Environment :: Console',
  ],

  install_requires=[
    'beaker>=1.8.0',
    'beautifulsoup4>=4.6.0,<4.7.0',
    'click>=5.0,<6.0',
    'elasticsearch>=5.0.0,<6.0.0',
    'Flask>=0.12.2,<0.13.0',
    'flask_cors>=3.0,<3.1',
    'gunicorn>=19.7.1,<20.0.0',
    'markdown>=2.6.9,<2.7',
    'py-gfm>=0.1.3,<0.2',
    'PyYAML>=3.12,<4',
    'lxml>=4.0, <5.0',
    'requests>=2.18.0,<3',
    'screepsapi>=0.5.1,<0.6',
    'websocket-client==0.52.0',
    "pypandoc>=1.4.0"
  ],

  extras_require={
    'dev': [
      'pypandoc>=1.4.0,<1.5.0',
      'twine',
      'wheel'
    ],
  },

  entry_points={
    'console_scripts': [
      'screepsdashboard=screepsdashboard.cli:cli',
    ],
  },

)
