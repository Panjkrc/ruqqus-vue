const namespaced = true

//import Vue from "vue"
import axios from 'axios'

import { getPost } from '../../api/Post.js';
import { getAccountPosts } from '../../api/Account.js';
import { getFeed } from '../../api/Feed.js';
import { getSearch } from '../../api/Search.js';

import { deletePost } from '../../api/Post.js';

const state = {
	activeType: null,
	itemsPerPage: 15,
	page: 1,
	sort: "all",
	next_exists: false,
	time_filter: 'day',
	guild_name: '',
	ids: [],
	posts: Object,
	comments: Object,
	lists: {
		activity: [],
		disputed: [],
		hot: [],
		top: [],
		new: [],
	},
	user: {
		posts: [],
		comments: []
	},
	loading_comments: true,
	loading_item: true,
	selectedItems: []
}

const getters = {
	activeIds (state) {
		const { activeType, itemsPerPage, lists } = state
		if (!activeType) {
			return []
		}
		const page = Number(state.route.params.page) || 1
		const start = (page - 1) * itemsPerPage
		const end = page * itemsPerPage
		return lists[activeType].slice(start, end)
	},

	// items that should be currently displayed.
	// this Array may not be fully fetched.
	activeItems (state, getters) {
		return getters.activeIds.map(id => state.items[id]).filter(_ => _)
	},
	getItems(state) {
		return state.posts
	},
	getIds(state) {
		return state.ids
	},
	getItemsLength(state) {
		return Object.keys(state.posts).length;
	},
	getItem: (state) => (id) => {
		// return Vue.set(state.posts, id)
		return state.posts[id]
	},
	// Count the number of items selected (in mod queue) by the guildmaster
	selectedItemsCount(state) {
		return state.selectedItems.length
	},
	// Get the status of voting action
	getItemVotedStatus: (state) => (id) => {
		return state.posts[id].itemVotedStatus
	},
	getItemVoteActionStatus: (state) => (id) => {
		return state.posts[id].itemVoteActionStatus
	},
	getItemVoteType: (state) => (id) => {
		return state.posts[id].voted
	},
	// Get the status of item's saved property
	getItemSavedStatus: (state) => (id) => {
		return state.posts[id].isSaved
	}
}

const mutations = {
	SET_ACTIVE_TYPE: (state, { type }) => {
		state.activeType = type
	},
	SET_LIST: (state, { type, ids }) => {
		state.lists[type] = ids
	},
	SET_ITEM: (state, item) => {
		// create vote action and vote status
		state.ids.push(item.id)
		let object = { itemVoteActionStatus: 0, itemVotedStatus: item.voted !== 0 }
		object = Object.assign(object, item)
		// set state posts object to item

		state.posts = Object.assign({}, state.posts, { [item.id]:object })
		console.log(state.posts)
	},
	SET_ITEMS: (state, items) => {
		for (let i = 0; i < items.length; i++) {
			let item = items[i];
			state.ids.push(item.id)
			// Vue.set(item, 'itemVoteActionStatus', 0)
			// Vue.set(item, 'itemVotedStatus', item.voted !== 0)
			//Vue.set(state.posts, item.id, item)
			let object = { itemVoteActionStatus: 0, itemVotedStatus: item.voted !== 0 }
			object = Object.assign(object, item)
			state.posts = Object.assign({}, state.posts, { [item.id]:object })
		}
		console.log(state.posts)
	},
	CLEAR_ITEMS: (state) => {
		state.ids = []
		state.posts = {}
		state.lists = {
			activity: [/*  number */],
			disputed: [],
			hot: [],
			top: [],
			new: [],
		}
	},

	/*
	MUTATIONS FOR USER ACTIONS
	*/

	// Voting
	SET_ITEM_VOTED_STATUS(state, { status, id }){
		state.posts[id].itemVotedStatus = status
	},
	SET_ITEM_VOTE_ACTION_STATUS(state, { status, id }){
		state.posts[id].itemVoteActionStatus = status
	},
	SET_ITEM_VOTE_TYPE(state, { type, id }){
		state.posts[id].voted = type
		//Vue.set(state.posts[id], 'voted', type)
	},

	// Deleting
	DELETE_ITEM: (state, id) => {
		//delete state.posts.id
		let i = state.ids.map(item => item.id).indexOf(id) // find index of your object
		state.ids.splice(i, 1) // remove the item from the array
	},

	// Saving

	// SET_ITEM_SAVED_STATUS(state, { status, id }){
	// 	state.posts[id].itemSavedStatus = status
	// },
	// SET_ITEM_SAVE_ACTION_STATUS(state, { status, id }){
	// 	state.posts[id].itemSaveActionStatus = status
	// },
	// SET_ITEM_SAVE_TYPE(state, { type, id }){
	// 	state.posts[id].saved = type
	// },

	// Moderation
	TOGGLE_ITEM(state, payload) {
		state.selectedItems = payload.id
		console.log(state.selectedItems)
	},
	DESELECT_ITEMS: (state) => {
		state.selectedItems = []
	}
}

const actions = {

	/*
	GET POSTS FROM THE SERVER
	*/

	fetchPost({ commit }, id) {
		//commit("CLEAR_ITEMS")
		getPost(id)
		.then(response => {
			commit("SET_ITEM", response.data)
			//commit('guild/SET_GUILD', response.data.guild, { root: true });
		})
	},
	fetchAccountPosts({ commit }, account) {
		commit("CLEAR_ITEMS")
		getAccountPosts(account)
		.then(response => {
			commit("SET_ITEMS", response.data.listing)
			commit('guild/SET_GUILDS', response.data.results, { root: true });
		})
	},
	fetchFeed({ commit }, payload) {
		if (payload.params.page === 1) {
			commit("CLEAR_ITEMS")
		}
		console.log(payload.params)
		getFeed(payload.feed, payload.params)
		.then(response => {
			commit("SET_ITEMS", response.data.results);
			//commit('guild/SET_GUILDS', response.data.results, { root: true });
		})
	},
	fetchSearch({ commit }, query) {
		commit("CLEAR_ITEMS")
		getSearch(query)
		.then(response => {
			commit("SET_ITEMS", response.data.results)
			commit('guild/SET_GUILDS', response.data.results, { root: true });
		})
	},

	/*
	USER ACTIONS
	*/

	votePost({ commit, dispatch, rootState}, obj){
		commit('SET_ITEM_VOTE_ACTION_STATUS', {status: 1, id: obj.post_id});
		const headers = {'Content-Type': 'multipart/form-data'}
		const data = new FormData();
		data.append('formkey', rootState.persist.v.formkey)
		axios({
			method: 'post',
			url: `/post/${obj.post_id}/${obj.vote}`,
			data: data,
			headers: headers
		}).then(
		function(response) {
			commit('SET_ITEM_VOTED_STATUS', {status: true, id: obj.post_id});
			commit('SET_ITEM_VOTE_ACTION_STATUS', {status: 2, id: obj.post_id});
			return response
		})
		.catch(error => {
			commit('SET_ITEM_VOTE_ACTION_STATUS', {status: 3, id: obj.post_id});
			dispatch('toasts/addNotification', {
				type: 'error',
				header: 'Failed to cast vote.',
				message: 'Please try again later.'
			},
			{
				root: true
			})
			return error
		})
	},
	deleteItem({commit}, id) {
		deletePost(id)
		.then(() => {              
			commit('DELETE_ITEM', id)
		})
	},


	/*
	MODERATOR ACTIONS
	*/

	toggleItem({commit}, id) { // guildmaster selecting items in mod queue
		commit('TOGGLE_ITEM', id)
	},
	deselectItems({commit}) { // guildmaster deselecting all selected items in mod queue
		commit('DESELECT_ITEMS')
	}
}

export default {
	namespaced,
	state,
	getters,
	mutations,
	actions,
}
