import React from "react";
import {
  Navbar,
  Container,
  Col,
  Grid,
  TextInput,
  Avatar,
  NavLink,
} from "@mantine/core";
import { IconSearch, IconUser } from "@tabler/icons-react";

export const Header = () => {
  return (
    <Navbar className="header">
      <Container>
        <Grid gutter="md">
          <Col span={12}>
            <NavLink>Home</NavLink>
            <NavLink>Browse Categories</NavLink>
            <NavLink>How it works</NavLink>
            <NavLink>About Us</NavLink>
          </Col>
          <Col
            span={12}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <TextInput
              placeholder="Search for items..."
              icon={<IconSearch />}
              radius="xl"
              style={{ marginRight: "1rem" }}
            />
            <Avatar
              size="md"
              radius="circle"
              color="blue"
              src="/path/to/user/avatar/image.jpg"
              alt="User Avatar"
            />
            <NavLink>Sign Up</NavLink>
            <NavLink>Login</NavLink>
            <NavLink>My Account</NavLink>
          </Col>
        </Grid>
      </Container>
    </Navbar>
  );
};

export default Header;
