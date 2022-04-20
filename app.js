axios.defaults.baseURL = 'http://localhost/api';

export default {
	data() {
		return {
			products: [],
			categories: [],
			order: {
				dir: 1,
				column: "name",
			},
			filters: {
				name: "",
			},
			perPage: 10,
			currentPage: 1,
			product: {
				id: null,
				name: "",
				category_id: null,
				price: ""
			},
			productModal: null,
			isEdit: false,
			errors: {},
			removedProductId: null
		};
	},

	mounted: function() {
		this.fetchProducts();
		this.fetchCategories();
	},

	computed: {
		productsPaginated() {
			let start = (this.currentPage - 1) * this.perPage
			let end = this.currentPage * this.perPage
			return this.productsSorted.slice(start, end)
		},
		productsSorted() {
			return this.productsFiltered.sort((a, b) => {
				let left = a[this.order.column],
					right = b[this.order.column];

				if (isNaN(left) && isNaN(right)) {
					if (left < right) return -1 * this.order.dir;
					else if (left > right) return 1 * this.order.dir;
					else return 0;
				} else {
					return (left - right) * this.order.dir;
				}
			});
		},
		sortType() {
			return this.order.dir === 1 ? "ascending" : "descending";
		},
		whenSearching() {
			return this.filters.name.length > 0;
		},
		productsFiltered() {
			let products = this.products;

			if (this.filters.name) {
				let findName = new RegExp(this.filters.name, 'i');
				products = products.filter(el => el.name.match(findName));
			}

			return products;
		},
		isFirstPage() {
			return this.currentPage === 1;
		},
		isLastPage() {
			return this.currentPage >= this.pages;
		},
		pages() {
			return Math.ceil(this.productsFiltered.length / this.perPage);
		},
		modalTitle() {
			return this.isEdit ? 'Edit Product' : 'Add New Product';
		},
		textButton() {
			return this.isEdit ? 'Update' : 'Save';
		}
	},

	methods: {
		fetchProducts() {
			axios.get('/product')
					.then(response => {
						// handle success
						this.products = response.data.data;
					});
		},
		fetchCategories() {
			axios.get('/category')
					.then(response => {
						// handle success
						this.categories = response.data.data;
					});
		},
		sort(column) {
			this.order.column = column;
			this.order.dir *= -1;
		},
		classes(column) {
			return [
				"sort-control",
				column === this.order.column ? this.sortType : "",
			];
		},
		clearText() {
			this.filters.name = "";
		},
		prev() {
			if (!this.isFirstPage) {
				return this.currentPage--;
			}
		},
		next() {
			if (!this.isLastPage){
				return this.currentPage++;
			}
		},
		switchPage(page) {
			this.currentPage = page;
		},
		showModal() {
			this.productModal = new bootstrap.Modal(this.$refs.vueModal);
			this.productModal.show();
		},
		saveOrUpdate() {
			if (this.isEdit) {
				this.update();
			} else {
				this.save();
			}
		},	
		save() {
			axios.post('/product', this.product)
				.then(response => {
					this.products.unshift(response.data.data);
					this.product = {
						id: null,
						name: "",
						category: null,
						price: ""
					};
					this.errors = {};
					this.productModal.hide();
				})
				.catch(error => {
					this.errors = error.response.data.errors;
				})
		},
		add() {
			this.isEdit = false;
			this.product = {
				id: null,
				name: "",
				category: "",
				price: ""
			};
			this.showModal();
		},
		edit(product) {
			this.product = Object.assign({}, product);
			this.isEdit = true;
			if (this.productModal !== null) {
				this.productModal.show();
			} else {
				this.showModal();
			}
		},
		update() {
			axios.put('/product/' + this.product.id, this.product)
				.then(response => {
					let index = this.products.findIndex(item => item.id === this.product.id);
					this.products.splice(index, 1, response.data.data);
					this.isEdit = false;
					this.errors = {};
					this.productModal.hide();
				})
				.catch(error => {
					this.errors = error.response.data.errors;
				})
			
		},
		remove(product) {
			if (confirm('Are you sure?')) {
				axios.delete('/product/' + product.id)
						.then(() => {
							this.removedProductId = product.id;

							new Promise(resolve => setTimeout(resolve, 1000))
								.then(() => {
									this.removedProductId = null
									let index = this.products.findIndex(item => item.id === product.id);
									this.products.splice(index, 1)
								})
						})
				
			}
		}
	},
};
