const authorise = (role) => {
  return (req, res, next) => {
    let reqrole=req.role
    if(role.includes(reqrole)){
        next()
    }else{
        res.send("you are not authorised")
    }
  };
};

module.exports = {
  authorise,
};
