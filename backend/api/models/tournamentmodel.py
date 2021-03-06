from django.db import models
from django.contrib.auth.models import User
from .teammodel import Team
from django.db.models.signals import post_save, post_delete


class Tournament(models.Model):
    organizer = models.ForeignKey(
        User, to_field="username", on_delete=models.CASCADE, related_name="organizer")
    name = models.CharField(max_length=250)
    gameName = models.CharField(max_length=250)
    matchDuration = models.IntegerField()
    breakDuration = models.IntegerField()
    deadLineDate = models.DateField()
    nbTeam = models.IntegerField()
    streamURL = models.CharField(max_length=1000)
    teams = models.ManyToManyField(Team, blank=True)
    referees = models.ManyToManyField(User, related_name="referees")

    def __str__(self):
        return self.name
