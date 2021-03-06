<template>
  <v-dialog
    v-model="isVisible"
    max-width="800px"
    @keydown.esc="hide"
    @click:outside="hide"
  >
    <v-card>
      <v-toolbar dark color="#01002a">
        <v-toolbar-title>
          Recruit a new member
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="hide">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-layout style="margin:20px;">
          <v-flex xs12>
            <v-alert
              class="text-xs-center"
              v-show="loading"
              outlined
              v-model="loading"
              type="info"
            >
              <v-progress-circular
                indeterminate
                color="#01002a"
              ></v-progress-circular>
            </v-alert>
            <template>
              <v-data-table
                v-show="!loading"
                :headers="headers"
                :items="users"
                sort-by="username"
                class="elevation-1"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title>USERS</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                  </v-toolbar>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon small class="mr-2" @click="Recruit(item)">
                    mdi-account-plus
                  </v-icon>
                </template>
              </v-data-table>
            </template>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import WtmApi from '@/services/WtmApiService'

export default {
  data: () => ({
    isVisible: false,
    loading: false,
    error: false,
    team: 0,
    teamMembers: [],

    users: [],
    headers: [
      { text: 'Username', value: 'username' },
      { text: 'Email', value: 'email' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]
  }),
  methods: {
    // To show the dialog
    show() {
      this.isVisible = true
      this.GetUsers()
    },

    // To hide the dialog
    hide() {
      this.error = false
      this.isVisible = false
      this.teamMembers = []
      this.users = []
    },

    // Get all users
    async GetUsers() {
      this.loading = true

      const response = await WtmApi.Request(
        'get',
        this.$store.state.apiUrl + 'users/',
        null,
        this.$store.getters.getAxiosHeader
      )

      if (response.isSuccess) {
        response.result.forEach(user => {
          if (!this.teamMembers.some(m => m.username === user.username)) {
            this.users.push(user)
          }
        })
      } else {
        this.$snotify.error('Unable to get users...')
      }

      this.loading = false
    },

    /**
     * Send a notification to a user that
     * we want to recruit in our team
     *
     * @param {Object}  user user to add as team member
     */
    async Recruit(user) {
      let notification = {
        message: 'You were invited to join ' + this.team.name + ' team!',
        seen: false,
        notificationType: 'INVITATION',
        user: user.id,
        team: this.team.id
      }

      const response = await WtmApi.Request(
        'post',
        this.$store.state.apiUrl + 'notifications/',
        notification,
        this.$store.getters.getAxiosHeader
      )

      if (response.isSuccess) {
        this.$snotify.success('Request sent')
      } else {
        this.$snotify.error('Unable to add user...')
      }
    }
  }
}
</script>
