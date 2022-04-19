axios.defaults.baseURL = 'http://localhost/api';

export default {
	data() {
		return {
			products: [],
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
				category: "",
				price: ""
			},
			productModal: null,
			isEdit: false
		};
	},

	mounted: function() {
		this.fetchProducts();
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
		categories() {
			let categories = this.products.map(el => el.category);
			return Array.from(new Set(categories))
						.sort((a, b) => {
							if (a < b) return -1;
							else if (a > b) return 1;
							else return 0;
						})
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
					})
					.catch(function (error) {
						// handle error
						console.log(error);
					})
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
			if (this.product.name && this.product.category && this.product.price) {
				this.product.id = this.products.length + 1;
				this.products.unshift(this.product);
				this.product = {
					id: null,
					name: "",
					category: "",
					price: ""
				};
				this.productModal.hide();
			} else {
				alert('Please input form properly');
			}
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
			let index = this.products.findIndex(item => item.id === this.product.id);
			this.products.splice(index, 1, this.product);
			this.isEdit = false;
			this.productModal.hide();
		},
		remove(product) {
			if (confirm('Are you sure?')) {
				let index = this.products.findIndex(item => item.id === product.id);
				this.products.splice(index, 1);
			}
		}
	},
};
