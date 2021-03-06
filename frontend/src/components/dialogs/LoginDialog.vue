<template>
  <v-dialog
    v-model="isVisible"
    max-width="500px"
    @keydown.esc="hide"
    @click:outside="hide"
    @keydown.enter="Login"
  >
    <v-card>
      <v-toolbar dark color="#01002a">
        <v-toolbar-title>Sign in</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="hide">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-form ref="form" style="padding:10px">
          <v-text-field
            v-model="username"
            label="Username"
            dense
            outlined
            clearable
            v-validate="'required'"
            data-vv-name="username"
            :error-messages="errors.collect('username')"
          ></v-text-field>
          <v-text-field
            :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
            v-model="pwd"
            label="Password"
            outlined
            dense
            :type="showPwd ? 'text' : 'password'"
            clearable
            v-validate="'required|min:8'"
            data-vv-name="password"
            :error-messages="errors.collect('password')"
            @click:append="showPwd = !showPwd"
          ></v-text-field>
          <v-alert
            v-show="error"
            v-model="error"
            dismissible
            outlined
            type="error"
          >
            An error occured... Please try later!
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions v-show="!loading">
        <router-link @click.native="hide" to="/register"
          >Sign up for free !</router-link
        >
        <v-spacer></v-spacer>
        <v-btn tile color="success" @click="Login">Sign in</v-btn>
      </v-card-actions>
      <v-card-actions v-show="loading">
        <v-spacer></v-spacer>
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-card-actions>
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
    showPwd: false,

    id: null,
    username: '',
    pwd: ''
  }),

  methods: {
    // To show the dialog
    show() {
      this.isVisible = true
    },

    // To hide the dialog
    hide() {
      this.error = false
      this.$refs.form.reset()
      this.isVisible = false
    },

    // Login the user
    async Login() {
      const result = await this.$validator.validate()

      if (result) {
        this.loading = true

        let user = {
          username: this.username,
          password: this.pwd
        }

        const response = await WtmApi.Request(
          'post',
          this.$store.state.apiUrl + 'auth/',
          user
        )

        if (response.isSuccess) {
          // Set user information and token in Vuex store
          this.$store.commit('setToken', response.result.token)
          this.$store.commit('setAuthUser', {
            authUserId: response.result.user_id,
            authUserEmail: response.result.email,
            authUserName: response.result.name,
            isAuthenticated: true
          })

          this.$refs.form.reset()
          this.$snotify.info(user.username + ' logged in successfuly!')
          this.GetNotifications()
          this.isVisible = false
        } else {
          this.$snotify.error('Unable to login...\nPlease try later...')
          this.error = true
        }

        this.loading = false
      }
    },

    // Get logged in user's notifications
    async GetNotifications() {
      this.loading = true

      const response = await WtmApi.GetNotifications(
        this.$store.state.apiUrl +
          'notifications?uid=' +
          this.$store.state.authUser.id,
        this.$store.getters.getAxiosHeader
      )

      if (response.isSuccess) {
        // Set the number of notifications in Vuex store
        this.$store.commit('updateNotif', response.counter)
      } else {
        this.$snotify.error('Unable to get notifications ...')
      }
      this.loading = false
    }
  }
}
</script>
