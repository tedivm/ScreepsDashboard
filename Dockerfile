FROM python:3.5
WORKDIR /app
COPY . /app
RUN pip install -e .
CMD ["gunicorn","-w","3","-b",":5000","screepsdashboard.app:app"]