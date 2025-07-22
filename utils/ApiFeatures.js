class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    search() {
      const keyword = this.queryStr.keyword
        ? {
            projectTitle: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          }
        : {};
      this.query = this.query.find({ ...keyword });
      return this;
    }
  
    filter() {
      const queryCopy = { ...this.queryStr };
      const removefield = ["keyword", "page"];
      removefield.forEach((el) => delete queryCopy[el]);
  
      this.query = this.query.find(queryCopy);
      return this;
    }
  
    pagination(resPerPage) {
      const currentpage = Number(this.queryStr.page) || 1;
      const skip = resPerPage * (currentpage - 1);
      this.query = this.query.limit(resPerPage).skip(skip);
      return this;
    }
  }
  
  export default ApiFeatures;
  