interface PaginationResult {
    offset: number;
    pageSize: number;
  }
  
  function paginate(page: number, pageSize: number): PaginationResult {
    const offset: number = (page - 1) * pageSize;
    return { offset, pageSize };
  }
  
  export { paginate };
  