
function paginate(page, pageSize) {
    const offset = (page - 1) * pageSize;
    return { offset, pageSize };
  }
  
module.exports = {
    paginate,
  };
  